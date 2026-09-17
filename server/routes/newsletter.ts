import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { upsertNewsletterSubscriber } from "../db";
import { DEFAULT_NEWSLETTER_SOURCE } from "../../shared/const";

const email = z.string().trim().toLowerCase().email().max(320);

export const newsletterRouter = router({
  subscribe: publicProcedure.input(z.object({ 
    email, 
    source: z.string().trim().max(80).optional() 
  })).mutation(async ({ input }) => { 
    await upsertNewsletterSubscriber(input.email, input.source || DEFAULT_NEWSLETTER_SOURCE); 
    return { success: true }; 
  }),
});
