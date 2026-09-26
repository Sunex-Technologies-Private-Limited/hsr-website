import { Router } from "express";
import crypto from "crypto";
import { env } from "../env";
import { getDb } from "../db";
import { orders, orderItems } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendOrderConfirmation } from "../email";

export const webhooksRouter = Router();

webhooksRouter.post("/razorpay", async (req, res) => {
  const secret = env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret";
  const signature = req.headers["x-razorpay-signature"];

  if (signature) {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }
  }

  const { event, payload } = req.body;

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
      
      if (order && order.status !== "paid") {
        await db.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id));
        
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        
        const downloadLinks = items.map(i => ({
          name: i.productName,
          url: `https://hsrdigitalhub.com/api/downloads/${i.productSlug}`
        }));
        
        await sendOrderConfirmation(order.customerEmail, order.customerName, order.orderNumber, downloadLinks);
      }
    } catch (e) {
      console.error("Webhook processing error:", e);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  res.status(200).json({ status: "ok" });
});
