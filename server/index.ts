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
import { orderItems, orders, downloadTokens, products } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

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

export const app = express();

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
const upload = multer({ 
  storage: env.AWS_S3_BUCKET ? multer.memoryStorage() : multer.diskStorage({ destination: uploadDir }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["application/pdf", "application/zip", "application/x-zip-compressed", "image/png", "image/jpeg", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});
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
      filename = `${crypto.randomBytes(16).toString('hex')}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
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
app.get("/api/downloads/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database error" });
    
    const tokens = await db.select().from(downloadTokens).where(eq(downloadTokens.token, token)).limit(1);
    const downloadToken = tokens[0];
    
    if (!downloadToken) {
      return res.status(404).json({ error: "Invalid or missing download token" });
    }
    
    if (downloadToken.expiresAt < new Date()) {
      return res.status(403).json({ error: "Download link has expired" });
    }
    
    if (downloadToken.remainingUses <= 0) {
      return res.status(403).json({ error: "Download limit reached" });
    }
    
    const items = await db.select({ item: orderItems, order: orders }).from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders.id)).where(eq(orderItems.id, downloadToken.orderItemId)).limit(1);
    const result = items[0];
    
    if (!result || !result.item) return res.status(404).json({ error: "Product not found" });
    if (result.order.status !== 'paid' && result.order.status !== 'fulfilled') return res.status(403).json({ error: "Order is not paid" });
    
    const item = result.item;
    
    // Decrement remaining uses
    await db.update(downloadTokens)
      .set({ remainingUses: downloadToken.remainingUses - 1 })
      .where(eq(downloadTokens.token, token));
      
    if (env.AWS_S3_BUCKET) {
      // Generate signed URL
      const command = new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: item.productSlug
      });
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return res.redirect(signedUrl);
    } else if (item.downloadPath) {
      // Fallback to local files
      const downloadPath = item.downloadPath.replace(/^\//, ''); // Remove leading slash
      return res.download(path.join(uploadDir, downloadPath), `${item.productSlug}-download`);
    } else {
      return res.status(404).json({ error: "File not found on server" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Download failed" });
  }
});

// SEO Routes
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nAllow: /\n\nSitemap: https://hsrdigitalhub.com/sitemap.xml\n");
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).send("Database error");
    
    const allProducts = await db.select().from(products).where(eq(products.active, 1));
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Add static routes
    const staticRoutes = ["/", "/shop", "/about", "/contact", "/faq", "/privacy-policy"];
    for (const route of staticRoutes) {
      xml += `  <url>\n    <loc>https://hsrdigitalhub.com${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }
    
    // Add product routes
    for (const p of allProducts) {
      xml += `  <url>\n    <loc>https://hsrdigitalhub.com/product/${p.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    }
    
    xml += `</urlset>`;
    
    res.type("application/xml");
    res.send(xml);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error generating sitemap");
  }
});



async function startServer() {
  const server = createServer(app);
  
  // 1. Security Middleware
  app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://cdn.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
        frameSrc: ["'self'", "https://api.razorpay.com"]
      }
    } : false,
  }));
  
  const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : [process.env.FRONTEND_URL || "https://hsrdigitalhub.com"];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  
  // 2. Rate Limiting
  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS, 
    max: RATE_LIMIT_MAX_REQUESTS, 
    message: RATE_LIMIT_MESSAGE,
    skip: (req) => req.originalUrl.startsWith("/api/webhooks")
  });
  
  // Strict Rate Limiting for Auth Routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth routes
    message: "Too many login attempts, please try again later."
  });
  
  const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 orders per hour per IP
    message: "Too many orders created, please try again later."
  });
  
  app.use("/api/trpc/auth.login", authLimiter);
  app.use("/api/trpc/auth.register", authLimiter);
  app.use("/api/trpc/orders.create", orderLimiter);
  app.use("/api", limiter);

  // 3. Observability & Logging
  app.use(pinoHttp({ logger }));
  
  // Webhooks need raw body for HMAC signature verification
  app.use("/api/webhooks/razorpay", express.raw({ type: 'application/json' }));
  app.use("/api/webhooks", webhooksRouter);

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
  return { app, server };
}

if (process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    logger.error(err, "Fatal error during server startup");
    process.exit(1);
  });
}
