# HSR Digital Hub — Developer Documentation

Welcome to the **HSR Digital Hub** repository. This project is a premium digital product storefront and e-commerce platform developed by **Sunex Technologies Private Limited**. 

This repository contains the full-stack source code for the platform, designed with a focus on high performance, beautiful interactive UI, and robust type-safe backend architecture.

---

## 📖 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Repository Structure](#repository-structure)
4. [Getting Started (Onboarding)](#getting-started-onboarding)
5. [Development Workflow](#development-workflow)
6. [Design & UI Guidelines](#design--ui-guidelines)
7. [Testing & Deployment](#testing--deployment)

---

## 🎯 Project Overview
HSR Digital Hub is a bespoke storefront for selling premium digital products (planners, toolkits, Notion templates, etc.). The design language strictly avoids "generic" UI patterns (e.g., standard Bento grids or basic Bootstrap layouts) in favor of high-end, editorial, and heavily interactive layouts (like typographic accordions, split-preview galleries, and smooth GSAP-like CSS animations).

**Core Features:**
- **Product Catalog & Filtering**: Fast, client-side routing for seamless browsing.
- **Interactive UI**: Custom-built interactive elements without heavy external JS libraries.
- **Cart & Favorites System**: Global state management using React Context.
- **Secure Checkout**: API integrations for payment gateways.
- **Authentication**: JWT/Session-based authentication via tRPC.

---

## 🛠 Technology Stack
We use a modern, strictly typed stack to ensure stability and developer velocity.

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [Wouter](https://github.com/molefrog/wouter) (Minimalist, hook-based routing)
- **Styling**: Vanilla CSS (`index.css`) with CSS Variables for theme tokens. We rely heavily on pure CSS for complex animations to maintain performance.
- **Components**: [Radix UI](https://www.radix-ui.com/) primitives & custom-built components.
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Server**: Node.js + [Express](https://expressjs.com/)
- **API**: [tRPC](https://trpc.io/) for end-to-end type safety without GraphQL overhead.
- **Database**: MySQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)

---

## 📂 Repository Structure

```text
hsr-digital-hub/
├── client/                 # Frontend React Application
│   ├── public/             # Static assets (images, logos)
│   └── src/
│       ├── components/     # Reusable UI components (Storefront.tsx, etc.)
│       ├── hooks/          # Custom React hooks (useCart, useFavorites)
│       ├── lib/            # Utilities, tRPC client, and mock store data
│       ├── pages/          # Top-level page components
│       ├── index.css       # Global stylesheet & design system variables
│       └── main.tsx        # React mounting point
├── server/                 # Backend Node/Express Application
│   ├── _core/              # System utilities and Vite integration
│   ├── routes/             # REST fallback routes
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   └── routers.ts          # tRPC router definitions (The core API)
├── drizzle/                # Database schema and migrations
├── package.json            # Project dependencies and scripts
└── vite.config.ts          # Vite build configuration
```
*Note: See [`server/README.md`](./server/README.md) for deeper backend documentation.*

---

## 🚀 Getting Started (Onboarding)

Follow these steps to set up your local development environment.

### 1. Prerequisites
- **Node.js**: v20 or higher.
- **MySQL**: A running local or remote MySQL instance.
- **Git**: For version control.

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/Sunex-Technologies-Private-Limited/hsr-website.git
cd hsr-website
npm install
```

### 3. Environment Variables
Copy the example environment file or create a `.env` file in the root directory. You must configure the database connection string:
```env
DATABASE_URL="mysql://username:password@localhost:3306/hsr_digital_hub"
PORT=3000
NODE_ENV="development"
```

### 4. Database Initialization
Push the Drizzle schema to your MySQL database to create the necessary tables:
```bash
npm run db:push
```
*(Optional)* Seed the database with mock products:
```bash
npx tsx seed.ts
```

### 5. Start Development Server
Boot up the Vite frontend and Express backend concurrently:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## 💻 Development Workflow

### API Communication (tRPC)
Do not use standard `fetch` or `axios` for internal API calls. Always use the tRPC client (`client/src/lib/trpc.ts`).
Example:
```tsx
import { trpc } from "@/lib/trpc";

// Fetching data
const { data, isLoading } = trpc.catalog.list.useQuery();

// Mutating data
const mutation = trpc.newsletter.subscribe.useMutation();
```

### State Management
- **Local State**: Use `useState`.
- **Global UI State**: Use React Context (e.g., `CartContext`, `FavoritesContext` located in `Storefront.tsx`).
- **Server State**: Handled automatically by tRPC (which uses TanStack React Query under the hood).

---

## 🎨 Design & UI Guidelines

HSR Digital Hub is a premium brand. **Aesthetics matter deeply.**
When building new UI components, adhere strictly to these rules:

1. **No Generic Layouts**: Avoid standard Bootstrap-style cards or basic grids. We use bespoke, editorial layouts (like floating stacked cards, interactive typographic bands, and split-preview menus).
2. **Typography**: We use `Fraunces` for headings (serif, elegant) and `Inter` for body copy. Respect the font weights and letter-spacing (`-0.02em` or `-0.04em` for large headers).
3. **Colors**: Never hardcode hex values. Always use our CSS variables: `var(--navy)`, `var(--cobalt)`, `var(--paper)`, `var(--ink)`, `var(--cream)`.
4. **Animations**: Rely on pure CSS `transition` and `transform` properties. Use our custom easing curve `var(--ease)` (`cubic-bezier(0.16, 1, 0.3, 1)`) for buttery-smooth, Apple-like motion.

---

## 🧪 Testing & Deployment

### Testing
We use **Vitest** for unit and integration testing.
```bash
npm run test
```
To check TypeScript types across the whole project:
```bash
npm run check
```

### Building for Production
The build process compiles both the React frontend and the Express backend.
```bash
npm run build
```
To start the compiled production server:
```bash
npm start
```

---
*Property of Sunex Technologies Private Limited. All rights reserved.*
