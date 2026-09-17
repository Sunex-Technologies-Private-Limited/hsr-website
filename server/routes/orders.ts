import { z } from "zod";
import { nanoid } from "nanoid";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createOrder, getProductBySlug, getDb } from "../db";
import { DEFAULT_CURRENCY, ORDER_PREFIX, STATUS_PENDING } from "../../shared/const";
import { orders, orderItems } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const email = z.string().trim().toLowerCase().email().max(320);
const slug = z.string().trim().min(1).max(160);

export const ordersRouter = router({
  create: publicProcedure.input(z.object({ 
    name: z.string().trim().min(2).max(160), 
    email, 
    items: z.array(z.object({ slug, quantity: z.number().int().min(1).max(10) })).min(1).max(20) 
  })).mutation(async ({ input }) => {
    const catalog = await Promise.all(input.items.map((item) => getProductBySlug(item.slug)));
    if (catalog.some((product) => !product)) throw new Error("One or more products are unavailable");
    const products = catalog as NonNullable<(typeof catalog)[number]>[];
    const normalizedItems = input.items.map((item, index) => ({ item, product: products[index] }));
    const totalAmount = normalizedItems.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
    const orderNumber = `${ORDER_PREFIX}${Date.now().toString(36).toUpperCase()}-${nanoid(6).toUpperCase()}`;
    const orderId = await createOrder({ 
      orderNumber, 
      customerEmail: input.email, 
      customerName: input.name, 
      totalAmount, 
      currency: DEFAULT_CURRENCY, 
      status: STATUS_PENDING 
    }, normalizedItems.map(({ item, product }) => ({ 
      orderId: 0, 
      productId: product.id, 
      productSlug: product.slug, 
      productName: product.name, 
      unitPrice: product.price, 
      downloadPath: product.imagePath 
    })));
    return { success: true, orderId, orderNumber, totalAmount, currency: DEFAULT_CURRENCY, status: STATUS_PENDING };
  }),

  simulatePayment: publicProcedure.input(z.object({
    orderId: z.number()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db.update(orders).set({ status: "paid" }).where(eq(orders.id, input.orderId));
    return { success: true };
  }),

  myOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    // Fetch orders for the logged-in user's email
    const myOrdersList = await db.select().from(orders).where(eq(orders.customerEmail, ctx.user.email as string)).orderBy(desc(orders.createdAt));
    
    // Fetch items for those orders
    const result = await Promise.all(myOrdersList.map(async (order) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    }));
    
    return result;
  })
});
