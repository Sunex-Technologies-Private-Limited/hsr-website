# Database Schema Documentation

This document outlines the core database tables, columns, and relationships for the HSR Digital Hub platform. Our schema is defined using [Drizzle ORM](https://orm.drizzle.team/) in `drizzle/schema.ts`.

All tables include `createdAt` and `updatedAt` timestamps by default, which are managed automatically by the database layer.

---

## 📦 Tables Overview

### 1. `users`
Stores registered customer and admin accounts.
- `id` (Primary Key, Auto-increment)
- `openId` (Unique ID for OAuth/SSO mapping)
- `password` (Hashed password for email/password logins)
- `name` (Full name)
- `email` (Unique email address)
- `loginMethod` (Tracks how the user registered, e.g., 'email', 'google')
- `role` (Enum: `user` | `admin` — defaults to `user`)
- `lastSignedIn` (Timestamp of last successful login)

### 2. `products`
The core catalog of digital products available for purchase.
- `id` (Primary Key, Auto-increment)
- `slug` (Unique URL-friendly identifier used in routes, e.g., `ai-workflow-starter-kit`)
- `name` (Display name)
- `category` (e.g., 'Productivity', 'Business')
- `type` (e.g., 'Planner', 'Toolkit', 'Template')
- `description` (Marketing copy)
- `price` (Current price stored in cents/paise to avoid float math errors)
- `compareAt` (Original price, used to calculate and display discounts)
- `imagePath` (Reference to the product cover image)
- `badge` (Optional highlight tag, e.g., 'Bestseller')
- `format` (File format delivered, e.g., 'Notion Template', 'PDF')
- `included` / `forWho` (Metadata describing the product features)
- `active` (Boolean flag to show/hide from storefront)

### 3. `reviews`
Customer reviews submitted for specific products.
- `id` (Primary Key, Auto-increment)
- `productId` (Foreign Key -> `products.id`)
- `reviewerName` 
- `reviewerEmail` 
- `rating` (Integer 1-5)
- `title` & `body` (Review content)
- `status` (Enum: `pending` | `approved` | `rejected` — defaults to `pending` requiring admin moderation)
- `verifiedPurchase` (Boolean flag if the email matches a past order for this product)
- `helpfulCount` (Number of users who upvoted this review)

### 4. `orders`
Top-level record of a customer purchase.
- `id` (Primary Key, Auto-increment)
- `orderNumber` (Unique alphanumeric identifier shown to customer, e.g., `HSR-29384`)
- `customerEmail` & `customerName`
- `totalAmount` (Total paid in cents/paise)
- `currency` (Defaults to 'INR')
- `status` (Enum: `pending` | `paid` | `fulfilled` | `cancelled`)
- `paymentProvider` & `paymentReference` (Tracking IDs from Stripe, Razorpay, etc.)

### 5. `orderItems`
Line items belonging to an order. Represents the actual digital goods purchased.
- `id` (Primary Key, Auto-increment)
- `orderId` (Foreign Key -> `orders.id`)
- `productId` (Foreign Key -> `products.id`)
- `productSlug` & `productName` (Denormalized for historical accuracy if product changes)
- `unitPrice` (Price paid at time of purchase)
- `downloadPath` (Secure, signed URL generated for the customer to download the asset)

### 6. `newsletterSubscribers`
Users opted in for marketing updates.
- `id` (Primary Key, Auto-increment)
- `email` (Unique email)
- `source` (Where they signed up, e.g., 'storefront', 'checkout')
- `status` (Enum: `subscribed` | `unsubscribed`)

---

## 🔄 Updating the Schema

If you need to change the structure of the database:
1. Update the TypeScript definitions in `schema.ts`.
2. Push the schema to your local dev database:
   ```bash
   npm run db:push
   ```
3. Update any relevant tRPC routers to read/write the new fields properly.
