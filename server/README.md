# Backend Architecture — HSR Digital Hub

This document details the backend architecture for the HSR Digital Hub platform. Our backend strictly adheres to a type-safe, monolithic architecture designed for speed, security, and developer ergonomics.

---

## 🏛 Core Principles

1. **End-to-End Type Safety**: We use **tRPC** exclusively for client-server communication. Do not create raw Express endpoints unless absolutely necessary (e.g., Webhooks, OAuth callbacks).
2. **Database First**: We use **Drizzle ORM** for highly optimized, type-safe SQL queries. No raw SQL string interpolation.
3. **Monorepo Style**: The frontend and backend live in the same repository. The backend serves the compiled Vite frontend in production, minimizing moving parts.

---

## 📂 Backend Directory Structure

```text
server/
├── index.ts              # Entry point: Express server setup, middleware, tRPC injection
├── routers.ts            # The tRPC root router (combines all sub-routers)
├── db.ts                 # Database connection pooling and Drizzle instance
├── storage.ts            # File system / blob storage utility layer
├── logger.ts             # Centralized Winston/Pino logger
├── env.ts                # Zod-validated environment variables
├── routes/               # Raw Express routes (Fallback, Webhooks, Legacy API)
│   ├── auth.ts           
│   ├── orders.ts         
│   └── catalog.ts        
└── _core/                # Internal framework code (Do not modify unless necessary)
    ├── trpc.ts           # tRPC context and procedure initialization
    ├── env.ts            # Core environment loading
    └── vite.ts           # Vite dev-server middleware integration
```

---

## 🔌 API Layer (tRPC)

All standard API communication happens via tRPC. The master router is located in `server/routers.ts`. 

### Existing Routers
- **`system`**: System health checks and environment exposure.
- **`auth`**: Login, registration, session management, and logout.
- **`catalog`**: Product data, filtering, and search logic.
- **`orders`**: Checkout flows, order history, and payment status.

### Adding a New Route
To create a new endpoint, follow this pattern in `server/routers.ts`:

1. Define the input schema using `zod`.
2. Use the appropriate procedure (`publicProcedure` or `protectedProcedure`).
3. Return the data.

```typescript
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { products } from "../drizzle/schema";

export const appRouter = router({
  catalog: router({
    // Example of adding a new route
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await db.query.products.findFirst({
          where: (products, { eq }) => eq(products.slug, input.slug),
        });
        return product;
      }),
  }),
});
```

---

## 🗄 Database Layer (Drizzle ORM)

We use MySQL. The schema is defined in `drizzle/schema.ts`.

### Schema Modifications
When you need to add a new table or modify a column:
1. Open `drizzle/schema.ts` and write the TypeScript definition.
2. Run the migration push command to instantly sync your local database:
   ```bash
   npm run db:push
   ```
3. Update any relevant tRPC routers to interact with the new data.

### Querying
Always prefer Drizzle's Relational Query API for standard reads:
```typescript
const userWithOrders = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, userId),
  with: {
    orders: true
  }
});
```

---

## 🔒 Security & Environment Variables

The server strictly validates environment variables at boot using Zod (see `server/env.ts`). If a required variable is missing, the server will intentionally crash.

**Required Variables:**
- `DATABASE_URL`: Connection string. Must include credentials.
- `SESSION_SECRET`: Random string for JWT/Cookie signing.
- `NODE_ENV`: Must be `production` or `development`.

**Authentication:**
We use secure, HTTP-only cookies for session management. The `protectedProcedure` in tRPC automatically validates the session cookie before allowing access to sensitive routes. Do not expose user passwords or PII in API responses.
