import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products, InsertProduct } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
  createProduct: publicProcedure.input(productSchema).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    await db.insert(products).values(input).onConflictDoUpdate({
      target: products.slug,
      set: input
    });
    return { success: true };
  }),
  
  updateProduct: publicProcedure.input(productSchema).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    await db.update(products).set(input).where(eq(products.slug, input.slug));
    return { success: true };
  }),
  
  deleteProduct: publicProcedure.input(z.object({ slug: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    await db.delete(products).where(eq(products.slug, input.slug));
    return { success: true };
  }),
  
  updateProductFile: publicProcedure.input(z.object({
    slug: z.string(),
    filename: z.string()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("No database connection");
    // We repurpose imagePath as the download file path for now to avoid schema migrations just for the mock.
    await db.update(products).set({ imagePath: input.filename }).where(eq(products.slug, input.slug));
    return { success: true };
  }),
});
