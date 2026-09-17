import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getActiveProducts, getProductBySlug } from "../db";

const slug = z.string().trim().min(1).max(160);

export const catalogRouter = router({
  list: publicProcedure.query(() => getActiveProducts()),
  bySlug: publicProcedure.input(z.object({ slug })).query(({ input }) => getProductBySlug(input.slug)),
});
