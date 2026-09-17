import { router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { authRouter } from "./routes/auth";
import { catalogRouter } from "./routes/catalog";
import { reviewsRouter } from "./routes/reviews";
import { newsletterRouter } from "./routes/newsletter";
import { adminRouter } from "./routes/admin";
import { ordersRouter } from "./routes/orders";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  catalog: catalogRouter,
  reviews: reviewsRouter,
  newsletter: newsletterRouter,
  orders: ordersRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
