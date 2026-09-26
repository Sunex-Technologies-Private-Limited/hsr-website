import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products, InsertProduct, orders, users, reviews } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

const productSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  type: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.number().int().min(0),
  compareAt: z.number().int().min(0).optional().nullable(),
  badge: z.string().optional().nullable(),
  accent: z.string().trim().min(1),
  imagePath: z.string().trim().min(1),
  coverLabel: z.string().trim().min(1),
  format: z.string().trim().min(1),
  included: z.string().trim().min(1),
  forWho: z.string().trim().min(1),
  active: z.number().int().default(1),
});

export const adminRouter = router({
  createProduct: adminProcedure.input(productSchema).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    const formattedInput = {
      ...input,
      price: input.price * 100,
      compareAt: input.compareAt ? input.compareAt * 100 : null
    };
    await db.insert(products).values(formattedInput).onConflictDoUpdate({
      target: products.slug,
      set: formattedInput
    });
    console.log(`[AUDIT] Admin ${ctx.user.email} created/updated product ${input.slug}`);
    return { success: true };
  }),
  
  updateProduct: adminProcedure.input(productSchema).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    const formattedInput = {
      ...input,
      price: input.price * 100,
      compareAt: input.compareAt ? input.compareAt * 100 : null
    };
    await db.update(products).set(formattedInput).where(eq(products.slug, input.slug));
    console.log(`[AUDIT] Admin ${ctx.user.email} updated product ${input.slug}`);
    return { success: true };
  }),
  
  deleteProduct: adminProcedure.input(z.object({ slug: z.string() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    await db.delete(products).where(eq(products.slug, input.slug));
    console.log(`[AUDIT] Admin ${ctx.user.email} deleted product ${input.slug}`);
    return { success: true };
  }),
  
  updateProductFile: adminProcedure.input(z.object({
    slug: z.string(),
    filename: z.string()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    await db.update(products).set({ downloadPath: input.filename }).where(eq(products.slug, input.slug));
    console.log(`[AUDIT] Admin ${ctx.user.email} updated product file for ${input.slug}`);
    return { success: true };
  }),

  listOrders: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }),

  setOrderStatus: adminProcedure.input(z.object({
    orderId: z.number(),
    status: z.enum(["pending", "paid", "fulfilled", "cancelled"])
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId));
    
    if (input.status === "paid") {
      const { fulfillOrder } = await import("../db");
      await fulfillOrder(input.orderId);
    }
    
    console.log(`[AUDIT] Admin ${ctx.user.email} changed order ${input.orderId} status to ${input.status}`);
    return { success: true };
  }),

  listReviews: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }),

  moderateReview: adminProcedure.input(z.object({
    reviewId: z.number(),
    status: z.enum(["pending", "approved", "rejected"])
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    await db.update(reviews).set({ status: input.status }).where(eq(reviews.id, input.reviewId));
    console.log(`[AUDIT] Admin ${ctx.user.email} moderated review ${input.reviewId} to ${input.status}`);
    
    // Recompute averageRating and reviewsCount
    const reviewRows = await db.select().from(reviews).where(eq(reviews.id, input.reviewId));
    if (reviewRows.length > 0) {
      const productId = reviewRows[0].productId;
      const allApproved = await db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")));
      const totalReviews = allApproved.length;
      const avgRating = totalReviews > 0 ? Math.round(allApproved.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;
      await db.update(products).set({ averageRating: avgRating, reviewsCount: totalReviews }).where(eq(products.id, productId));
    }
    
    return { success: true };
  }),

  listCustomers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    return db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.createdAt));
  }),
});
