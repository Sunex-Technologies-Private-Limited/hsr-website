import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(), // We can keep this for compatibility
  password: text("password"), // Hashed password
  name: text("name"),
  email: text("email").unique(),
  loginMethod: text("loginMethod"),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  lastSignedIn: integer('lastSignedIn', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const products = sqliteTable("products", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
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
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  productId: integer("productId").notNull(),
  reviewerName: text("reviewerName").notNull(),
  reviewerEmail: text("reviewerEmail"),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").$type<"pending" | "approved" | "rejected">().default("pending").notNull(),
  verifiedPurchase: integer("verifiedPurchase").default(0).notNull(),
  helpfulCount: integer("helpfulCount").default(0).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const orders = sqliteTable("orders", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderNumber: text("orderNumber").notNull().unique(),
  customerEmail: text("customerEmail").notNull(),
  customerName: text("customerName").notNull(),
  totalAmount: integer("totalAmount").notNull(),
  currency: text("currency").default("INR").notNull(),
  status: text("status").$type<"pending" | "paid" | "fulfilled" | "cancelled">().default("pending").notNull(),
  paymentProvider: text("paymentProvider"),
  paymentReference: text("paymentReference"),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const orderItems = sqliteTable("orderItems", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  productSlug: text("productSlug").notNull(),
  productName: text("productName").notNull(),
  unitPrice: integer("unitPrice").notNull(),
  downloadPath: text("downloadPath"),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const newsletterSubscribers = sqliteTable("newsletterSubscribers", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  source: text("source").default("storefront").notNull(),
  status: text("status").$type<"subscribed" | "unsubscribed">().default("subscribed").notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
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
