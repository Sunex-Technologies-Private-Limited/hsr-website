# HSR Digital Hub - Technical Requirements Document (TRD)

## 1. Architecture Overview
HSR Digital Hub employs a monolithic architecture utilizing React 19 for the SPA frontend and an Express Node.js server for the backend. Communication between client and server is strictly typed using tRPC. The platform interfaces with external services for payments (Razorpay), emails (Resend), and cloud storage (AWS S3).

## 2. Technology Stack
- **Frontend:** React 19, Vite, Wouter (Routing), Tailwind CSS (mixed with semantic Vanilla CSS for brand elements), Radix UI (accessible primitives).
- **Backend:** Node.js, Express, tRPC (v11), Zod (Validation).
- **Database:** PostgreSQL (production), Drizzle ORM.
- **Infrastructure & Integrations:** Razorpay (Payments), Resend (Transactional Emails), AWS S3 (Secure File Storage), Helmet (Security Headers).

## 3. Database Schema & Integrity
Migrated from SQLite to PostgreSQL to ensure concurrent transactional safety and data integrity.
- **Primary Entities:** `users`, `products`, `orders`, `orderItems`, `reviews`, `downloadTokens`.
- **Integrity Constraints:**
  - Strict Foreign Keys: `orderItems.orderId` references `orders.id`, `downloadTokens.orderItemId` references `orderItems.id`.
  - Financial Data: Stored purely in Integer Paise (e.g., ₹199.00 = 19900) to prevent floating-point arithmetic errors.
  - Identification: Usage of `nanoid` (unguessable tokens) for order confirmations to prevent Insecure Direct Object References (IDOR).

## 4. Security Implementation
- **Payment Verification:** Razorpay webhooks are mounted using `express.raw()` to ensure accurate HMAC SHA-256 signature calculation. Client-side success events trigger a mandatory backend verification mutation before fulfilling orders.
- **Authentication:** Role-Based Access Control (RBAC) via JWTs. Admin routes are strictly protected by `adminProcedure` tRPC middleware.
- **Middleware Hardening:** 
  - Strict CORS configured via environment variables.
  - Helmet Content-Security-Policy (CSP) restricted to trusted domains (`checkout.razorpay.com`, `fonts.googleapis.com`).
  - IP-based rate limiting on sensitive endpoints (auth, order creation, webhooks).
- **Asset Protection:** Downloads are authorized via `downloadTokens` that enforce expiry dates and maximum usage counts. S3 URLs are pre-signed and short-lived.

## 5. Development & Deployment Protocol
- **Package Manager:** Strictly `pnpm` to avoid lockfile conflicts.
- **Environment Management:** Fail-closed initialization. The application terminates on startup if critical secrets (`DATABASE_URL`, `RAZORPAY_KEY_SECRET`) are missing.
- **Observability:** Centralized logging via `pino` and `pino-http`.

## 6. Future Technical Roadmap
- Implementation of Server-Side Rendering (SSR) via Next.js or TanStack Start for improved SEO.
- Integration of a robust full-text search engine (e.g., Meilisearch) as the catalog scales.
- Idempotent outbox pattern for guaranteed transactional email delivery.
