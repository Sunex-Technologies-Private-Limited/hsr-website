import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createReview, getApprovedReviews, getProductBySlug, markReviewHelpful } from "../db";
import { STATUS_PENDING } from "../../shared/const";

const slug = z.string().trim().min(1).max(160);
const email = z.string().trim().toLowerCase().email().max(320);

export const reviewsRouter = router({
  list: publicProcedure.input(z.object({ slug })).query(async ({ input }) => {
    const product = await getProductBySlug(input.slug);
    if (!product) throw new Error("Product not found");
    return getApprovedReviews(product.id);
  }),
  submit: publicProcedure.input(z.object({
    slug, 
    name: z.string().trim().min(2).max(160), 
    email: email.optional(), 
    rating: z.number().int().min(1).max(5), 
    title: z.string().trim().min(3).max(180), 
    body: z.string().trim().min(10).max(4000) 
  })).mutation(async ({ input }) => {
    const product = await getProductBySlug(input.slug);
    if (!product) throw new Error("Product not found");
    await createReview({ 
      productId: product.id, 
      reviewerName: input.name, 
      reviewerEmail: input.email, 
      rating: input.rating, 
      title: input.title, 
      body: input.body, 
      status: STATUS_PENDING, 
      verifiedPurchase: 0, 
      helpfulCount: 0 
    });
    return { success: true, status: STATUS_PENDING };
  }),
  helpful: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { 
    await markReviewHelpful(input.id); 
    return { success: true }; 
  }),
});
