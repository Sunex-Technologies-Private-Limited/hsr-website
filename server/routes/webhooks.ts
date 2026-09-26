import { Router } from "express";
import crypto from "crypto";
import { env } from "../env";
import { getDb } from "../db";
import { orders, orderItems } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendOrderConfirmation } from "../email";

export const webhooksRouter = Router();

webhooksRouter.post("/razorpay", async (req, res) => {
  const secret = env.RAZORPAY_KEY_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: "Missing signature" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(req.body) // req.body is now a raw Buffer from express.raw
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const inputBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== inputBuffer.length || !crypto.timingSafeEqual(expectedBuffer, inputBuffer)) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  let event, payload;
  try {
    const parsed = JSON.parse(req.body.toString("utf8"));
    event = parsed.event;
    payload = parsed.payload;
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  // We handle payment.captured as it means the payment was successful
  if (event === "payment.captured" || event === "order.paid") {
    const orderEntity = payload.payment?.entity || payload.order?.entity;
    const razorpayOrderId = orderEntity?.order_id || orderEntity?.id;

    if (!razorpayOrderId) {
      return res.status(400).json({ error: "Missing order_id" });
    }

    try {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      
      const orderList = await db.select().from(orders).where(eq(orders.paymentReference, razorpayOrderId)).limit(1);
      const order = orderList[0];
      
      if (order) {
        if (order.status === "paid") {
          // Idempotency: Already processed
          return res.status(200).json({ success: true, message: "Already processed" });
        }
        
        await db.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id));
        
        const { fulfillOrder } = await import("../db");
        await fulfillOrder(order.id);
      }
    } catch (e) {
      console.error("Webhook processing error:", e);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  res.status(200).json({ status: "ok" });
});
