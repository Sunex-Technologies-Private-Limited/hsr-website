# Backend Architecture

The backend of HSR Digital Hub is designed to be robust, type-safe, and easily extensible. It is built using **Express** and **TRPC**, with **Drizzle ORM** for database interactions.

## Entry Point
The main entry point for the backend is [`server/index.ts`](file:///c:/Users/omkar/hsr-digital-hub/server/index.ts). It sets up the Express application, configures middleware, registers OAuth and Storage routes, and initializes the TRPC middleware.

## Directory Structure
- `index.ts` - Main server entry point and setup.
- `routers.ts` - Defines all TRPC routers and API endpoints.
- `db.ts` - Database connection and Drizzle ORM queries.
- `_core/` - Internal utilities, context creation, OAuth handlers, and Vite integration logic.

## TRPC API
We use TRPC for end-to-end type safety between the client and server. The main router is defined in `server/routers.ts` and contains the following sub-routers:
- **`system`**: System health and configuration.
- **`auth`**: User authentication and session management.
- **`catalog`**: Product listing and retrieval.
- **`reviews`**: Product review submissions and helpfulness tracking.
- **`newsletter`**: Newsletter subscription management.
- **`orders`**: Order creation and processing.

To add a new route:
1. Define the input schema using Zod.
2. Create the procedure in `server/routers.ts`.
3. Add the corresponding database query in `server/db.ts`.

## Database Schema (Drizzle ORM)
The database schema is defined in `drizzle/schema.ts`. We use Drizzle ORM for type-safe queries. To update the schema:
1. Modify `drizzle/schema.ts`.
2. Run `npm run db:push` to apply changes directly to the database.

## Environment Variables
The backend relies on several environment variables for configuration:
- `DATABASE_URL`: Connection string for the MySQL database.
- `PORT`: Port on which the server runs (defaults to 3000).
- `NODE_ENV`: Defines the environment (`development` or `production`).
