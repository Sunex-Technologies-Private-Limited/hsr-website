# Technical Requirements Document (TRD)

## 1. System Architecture Overview
The HSR Digital Hub is designed as a **Monolithic Full-Stack Application** to optimize developer velocity and deployment simplicity while maintaining strict boundaries between client and server logic. 

**Core Stack:**
- **Frontend:** React 19, Vite, Wouter (Routing), Radix UI (Primitives)
- **Backend:** Node.js, Express, tRPC
- **Database:** MySQL via Drizzle ORM
- **Styling:** Vanilla CSS with CSS Variables

## 2. Frontend Architecture
### 2.1 Routing & State
- **Routing:** Handled via `wouter` for a minimal, hook-based routing approach.
- **Global State:** React Context API for `CartContext` and `FavoritesContext`. 
- **Server State:** TanStack React Query (abstracted by tRPC) for data fetching, caching, and mutations.

### 2.2 Styling & UI Components
- **CSS Strategy:** Pure CSS for complex animations to maintain 60fps performance. Heavy reliance on CSS custom properties for theming.
- **Component Library:** Headless UI components from Radix UI styled with custom CSS. Icons provided by Lucide React.
- **Avoidances:** No heavy CSS-in-JS runtimes (like Styled Components) or generic utility frameworks (like basic Tailwind) unless strictly custom-configured for premium aesthetics.

## 3. Backend Architecture
### 3.1 API Layer
- **tRPC:** All communication between frontend and backend occurs via tRPC. This ensures end-to-end type safety. There are no manual `fetch` calls to REST endpoints (except for webhooks/external integrations).
- **Validation:** Zod is used for runtime schema validation on all inputs and outputs.

### 3.2 Database Layer
- **ORM:** Drizzle ORM provides type-safe SQL queries. 
- **Database:** MySQL is the primary data store.
- **Migrations:** Managed entirely by Drizzle via `drizzle-kit`.

## 4. Security & Compliance
- **Authentication:** HttpOnly, SameSite=Lax cookies for session management to prevent XSS. 
- **Data Integrity:** Strict input parsing via Zod. Invalid requests are rejected at the edge (HTTP 400).
- **Rate Limiting:** Applied via Express middleware on sensitive routes (e.g., login, checkout).

## 5. Error Handling Strategy
- **Client-Facing Errors:** Controlled error responses via `TRPCError`. Users receive sanitized, human-readable messages.
- **Internal Errors:** Stack traces are logged securely on the server and never leaked to the client.

## 6. Deployment & CI/CD
- **Build Process:** Vite compiles the frontend static assets; TypeScript compiles the backend Express server. Express serves the static Vite output in production.
- **Environment:** Node v20+. Strict validation of `.env` files on startup.
