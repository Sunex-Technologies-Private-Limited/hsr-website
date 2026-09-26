import "./env"; // Validates env at startup
import { env } from "./env";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { logger } from "./logger";
import { DEFAULT_PORT, EXPRESS_BODY_LIMIT, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_MESSAGE, RATE_LIMIT_WINDOW_MS } from "./const";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";
import { webhooksRouter } from "./routes/webhooks";
import { createContext } from "./_core/context";
import { serveStatic, setupVite } from "./_core/vite";
import fs from "fs";
import path from "path";
import multer from "multer";
import { getDb } from "./db";
import { orderItems, orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = DEFAULT_PORT): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // 1. Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Often conflicts with Vite dev server
  }));
  app.use(cors());
  
  // 2. Rate Limiting
  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS, 
    max: RATE_LIMIT_MAX_REQUESTS, 
    message: RATE_LIMIT_MESSAGE
  });
  
  // Strict Rate Limiting for Auth Routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth routes
    message: "Too many login attempts, please try again later."
  });
  
  app.use("/api/trpc/auth.login", authLimiter);
  app.use("/api/trpc/auth.register", authLimiter);
  app.use("/api", limiter);

  // 3. Observability & Logging
  app.use(pinoHttp({ logger }));
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: EXPRESS_BODY_LIMIT }));
  app.use(express.urlencoded({ limit: EXPRESS_BODY_LIMIT, extended: true }));
  
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  
  app.use("/api/webhooks", webhooksRouter);
  
  // 4. tRPC API setup
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  

  
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const s3 = new S3Client({
    region: env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
    }
  });

  // File Upload Route
  const upload = multer({ storage: env.AWS_S3_BUCKET ? multer.memoryStorage() : multer.diskStorage({ destination: uploadDir }) });
  app.post("/api/admin/upload", upload.single("file"), async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      if (!user || user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      
      let filename = req.file.filename;
      
      if (env.AWS_S3_BUCKET) {
        filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await s3.send(new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: filename,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }));
      }
      
      res.json({ success: true, path: filename });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Secure Download Route
  app.get("/api/downloads/:slug", async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      
      const slug = req.params.slug;
      const db = await getDb();
      if (!db) return res.status(500).json({ error: "Database error" });
      
      // Verify purchase
      const userOrders = await db.select().from(orders).where(eq(orders.customerEmail, user.email as string));
      let hasPurchased = false;
      let downloadPath = null;
      
      for (const order of userOrders) {
        if (order.status !== "paid") continue;
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        const item = items.find((i: any) => i.productSlug === slug);
        if (item) {
          hasPurchased = true;
          downloadPath = item.downloadPath;
          break;
        }
      }
      
      // If not purchased, maybe they are admin?
      if (!hasPurchased && user.role !== "admin") {
        return res.status(403).json({ error: "You have not purchased this product." });
      }
      
      // Serve the file
      if (downloadPath) {
        if (env.AWS_S3_BUCKET) {
          const command = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: downloadPath,
            ResponseContentDisposition: `attachment; filename="${slug}-download"`,
          });
          const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
          return res.redirect(url);
        } else if (fs.existsSync(path.join(uploadDir, downloadPath))) {
          return res.download(path.join(uploadDir, downloadPath), `${slug}-download`);
        }
      }
      
      // Mock fallback if file doesn't exist or downloadPath is missing
      res.setHeader("Content-Type", "text/plain");
      res.send(`This is a mock digital download for ${slug}. In production with AWS_S3_BUCKET set, this would securely redirect to your S3 file.`);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Download failed" });
    }
  });
  
  // 5. Frontend Serving
  // development mode uses Vite, production mode uses static files
  if (env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(env.PORT || DEFAULT_PORT.toString());
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.warn(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((err) => {
  logger.error(err, "Fatal error during server startup");
  process.exit(1);
});
