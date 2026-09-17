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
import { createContext } from "./_core/context";
import { serveStatic, setupVite } from "./_core/vite";
import fs from "fs";
import path from "path";
import multer from "multer";
import { getDb } from "./db";
import { orderItems, orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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
  app.use("/api", limiter);

  // 3. Observability & Logging
  app.use(pinoHttp({ logger }));
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: EXPRESS_BODY_LIMIT }));
  app.use(express.urlencoded({ limit: EXPRESS_BODY_LIMIT, extended: true }));
  
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  
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

  // File Upload Route
  const upload = multer({ dest: uploadDir });
  app.post("/api/admin/upload", upload.single("file"), async (req, res) => {
    try {
      // Mock authorization
      const user = { role: "admin" };
      if (!user || user.role !== "admin") return res.status(401).json({ error: "Unauthorized" });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const filename = req.file.filename;
      res.json({ success: true, path: filename });
    } catch (e) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Secure Download Route
  app.get("/api/downloads/:slug", async (req, res) => {
    try {
      // Mock authorization
      const user = { id: 1, email: "test@example.com", role: "user" };
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
          // In this mock, downloadPath stores the multer filename
          downloadPath = item.downloadPath || slug + ".pdf"; 
          break;
        }
      }
      
      // If not purchased, maybe they are admin? (for testing)
      if (!hasPurchased && user.role !== "admin") {
        return res.status(403).json({ error: "You have not purchased this product." });
      }
      
      // Serve the file
      if (downloadPath && fs.existsSync(path.join(uploadDir, downloadPath))) {
        res.download(path.join(uploadDir, downloadPath), `${slug}-download`);
      } else {
        // Mock fallback if file doesn't exist
        res.setHeader("Content-Type", "text/plain");
        res.send(`This is a mock digital download for ${slug}. In production, this would be your PDF/ZIP file.`);
      }
    } catch (e) {
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
