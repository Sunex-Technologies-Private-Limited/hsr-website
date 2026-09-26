import { integer, pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: text("openId").notNull().unique(), // We can keep this for compatibility
  password: text("password"), // Hashed password
  name: text("name"),
  email: text("email").unique(),
  loginMethod: text("loginMethod"),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  lastSignedIn: timestamp('lastSignedIn').defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  compareAt: integer("compareAt"),
  badge: text("badge"),
  accent: text("accent").notNull(),
  imagePath: text("imagePath").notNull(),
  coverLabel: text("coverLabel").notNull(),
  format: text("format").notNull(),
  included: text("included").notNull(),
  forWho: text("forWho").notNull(),
  active: integer("active").default(1).notNull(),
  digitalAssetUrl: text("digitalAssetUrl"),
  downloadPath: text("downloadPath"),
  averageRating: integer("averageRating").default(0).notNull(),
  reviewsCount: integer("reviewsCount").default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("productId").references(() => products.id).notNull(),
  reviewerName: text("reviewerName").notNull(),
  reviewerEmail: text("reviewerEmail"),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").$type<"pending" | "approved" | "rejected">().default("pending").notNull(),
  verifiedPurchase: integer("verifiedPurchase").default(0).notNull(),
  helpfulCount: integer("helpfulCount").default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  accessToken: text("accessToken").unique(), // Unguessable token for secure /order-confirmation/:token
  orderNumber: text("orderNumber").notNull().unique(),
  customerEmail: text("customerEmail").notNull(),
  customerName: text("customerName").notNull(),
  totalAmount: integer("totalAmount").notNull(),
  currency: text("currency").default("INR").notNull(),
  status: text("status").$type<"pending" | "paid" | "fulfilled" | "cancelled">().default("pending").notNull(),
  paymentProvider: text("paymentProvider"),
  paymentReference: text("paymentReference"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").references(() => orders.id).notNull(),
  productId: integer("productId").references(() => products.id).notNull(),
  productSlug: text("productSlug").notNull(),
  productName: text("productName").notNull(),
  unitPrice: integer("unitPrice").notNull(),
  downloadPath: text("downloadPath"),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletterSubscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").default("storefront").notNull(),
  status: text("status").$type<"subscribed" | "unsubscribed">().default("subscribed").notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const downloadTokens = pgTable("downloadTokens", {
  token: text("token").primaryKey(),
  orderItemId: integer("orderItemId").references(() => orderItems.id).notNull(),
  productSlug: text("productSlug").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  remainingUses: integer("remainingUses").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
