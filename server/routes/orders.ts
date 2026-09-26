import { z } from "zod";
import { nanoid } from "nanoid";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createOrder, getProductBySlug, getDb } from "../db";
import { DEFAULT_CURRENCY, ORDER_PREFIX, STATUS_PENDING } from "../../shared/const";
import { env } from "../env";
import Razorpay from "razorpay";
import { orders, orderItems, downloadTokens } from "../../drizzle/schema";
import { eq, desc, inArray } from "drizzle-orm";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";

const email = z.string().trim().toLowerCase().email().max(320);
const slug = z.string().trim().min(1).max(160);

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const ordersRouter = router({
  create: publicProcedure.input(z.object({ 
    name: z.string().trim().min(2).max(160), 
    email, 
    phone: z.string().trim().optional(),
    country: z.string().trim().optional(),
    gstin: z.string().trim().optional(),
    items: z.array(z.object({ slug, quantity: z.number().int().min(1).max(10) })).min(1).max(20) 
  })).mutation(async ({ input, ctx }) => {
    const catalog = await Promise.all(input.items.map((item) => getProductBySlug(item.slug)));
    if (catalog.some((product) => !product)) throw new Error("One or more products are unavailable");
    const products = catalog as NonNullable<(typeof catalog)[number]>[];
    
    // Strict validations (B5)
    for (const product of products) {
      if (!product.active) throw new TRPCError({ code: "BAD_REQUEST", message: `Product ${product.name} is inactive` });
      if (product.badge === "Coming Soon") throw new TRPCError({ code: "BAD_REQUEST", message: `Product ${product.name} is not available yet` });
      if (!product.digitalAssetUrl && !product.imagePath) throw new TRPCError({ code: "BAD_REQUEST", message: `Product ${product.name} missing digital asset` });
    }

    const normalizedItems = input.items.map((item, index) => ({ item, product: products[index] }));
    const totalAmount = normalizedItems.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
    const orderNumber = `${ORDER_PREFIX}${Date.now().toString(36).toUpperCase()}-${nanoid(6).toUpperCase()}`;
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount, // DB price is already in paise (e.g. 19900 = ₹199)
      currency: DEFAULT_CURRENCY,
      receipt: orderNumber,
    });

    const accessToken = nanoid(32);

    const orderId = await createOrder({ 
      orderNumber, 
      accessToken,
      customerEmail: input.email, 
      customerName: input.name, 
      customerPhone: input.phone,
      customerCountry: input.country,
      customerGstin: input.gstin,
      totalAmount, 
      currency: DEFAULT_CURRENCY, 
      status: STATUS_PENDING,
      paymentProvider: "razorpay",
      paymentReference: razorpayOrder.id,
      userId: ctx.user?.id || null, // B9
    }, normalizedItems.map(({ item, product }) => ({ 
      orderId: 0, 
      productId: product.id, 
      productSlug: product.slug, 
      productName: product.name, 
      unitPrice: product.price, 
      downloadPath: product.digitalAssetUrl || product.imagePath 
    })));
    
    return { 
      success: true, 
      orderId, 
      accessToken,
      orderNumber, 
      totalAmount, 
      currency: DEFAULT_CURRENCY, 
      status: STATUS_PENDING, 
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: env.RAZORPAY_KEY_ID
    };
  }),

  verifyPayment: publicProcedure.input(z.object({
    orderId: z.number(),
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const secret = env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest("hex");
      
    const expectedBuffer = Buffer.from(expectedSignature);
    const inputBuffer = Buffer.from(input.razorpaySignature);
    
    if (expectedBuffer.length !== inputBuffer.length || !crypto.timingSafeEqual(expectedBuffer, inputBuffer)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid payment signature" });
    }
    
    const orderList = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
    const order = orderList[0];
    if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    
    if (order.paymentReference !== input.razorpayOrderId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Payment reference mismatch" });
    }
    
    // Fetch from Razorpay to confirm captured amount (B6)
    try {
      const payment = await razorpay.payments.fetch(input.razorpayPaymentId);
      if (payment.amount !== order.totalAmount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Amount mismatch detected" });
      }
    } catch (err) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Could not verify payment amount with Razorpay" });
    }
    
    if (order.status !== "paid") {
      await db.update(orders).set({ status: "paid" }).where(eq(orders.id, input.orderId));
      const { fulfillOrder } = await import("../db");
      await fulfillOrder(order.id);
    }
    
    return { success: true };
  }),

  getByToken: publicProcedure.input(z.object({
    token: z.string()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const orderList = await db.select().from(orders).where(eq(orders.accessToken, input.token)).limit(1);
    if (!orderList[0]) throw new Error("Order not found");
    
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderList[0].id));
    
    let tokens: any[] = [];
    if (items.length > 0) {
      tokens = await db.select().from(downloadTokens).where(inArray(downloadTokens.orderItemId, items.map(i => i.id)));
    }
    
    const itemsWithTokens = items.map(item => {
      const tokenObj = tokens.find(t => t.orderItemId === item.id);
      return { ...item, downloadToken: tokenObj?.token };
    });

    return { ...orderList[0], items: itemsWithTokens };
  }),

  myOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    // Fetch orders for the logged-in user's email
    const myOrdersList = await db.select().from(orders).where(eq(orders.customerEmail, ctx.user.email as string)).orderBy(desc(orders.createdAt));
    
    // Fetch items and tokens for those orders
    const result = await Promise.all(myOrdersList.map(async (order) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      const itemsWithTokens = await Promise.all(items.map(async (item) => {
        const tokens = await db.select().from(downloadTokens).where(eq(downloadTokens.orderItemId, item.id));
        return { ...item, token: tokens[0]?.token || null };
      }));
      return { ...order, items: itemsWithTokens };
    }));
    
    return result;
  })
});
