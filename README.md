# HSR Digital Hub

HSR Digital Hub is a robust e-commerce and digital product platform built with a modern, type-safe stack.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Radix UI, Vite
- **Backend**: Express, TRPC, Drizzle ORM, MySQL
- **Tooling**: TypeScript, Prettier, Vitest

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MySQL Database

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Ensure `DATABASE_URL` is set to your MySQL instance in the `.env` file.

3. Initialize the database:
   ```bash
   npm run db:push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Scripts
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm start` - Starts the production server (requires a prior build).
- `npm run check` - Runs TypeScript type checking.
- `npm run test` - Runs unit tests using Vitest.

## Backend Architecture
See [server/README.md](file:///c:/Users/omkar/hsr-digital-hub/server/README.md) for detailed information on the backend routes and database schema.
See [ARCHITECTURE.md](file:///c:/Users/omkar/hsr-digital-hub/ARCHITECTURE.md) for a high-level system diagram and security overview.

## Contributing
Please see our [CONTRIBUTING.md](file:///c:/Users/omkar/hsr-digital-hub/CONTRIBUTING.md) for guidelines on how to submit pull requests and set up your local development environment.
