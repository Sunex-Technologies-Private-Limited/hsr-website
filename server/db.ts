import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { InsertOrder, InsertOrderItem, InsertProduct, InsertReview, InsertUser, newsletterSubscribers, orderItems, orders, products, reviews, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { ROLE_ADMIN, STATUS_APPROVED, STATUS_SUBSCRIBED, DEFAULT_NEWSLETTER_SOURCE } from "../shared/const";
import path from "path";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    try {
      const sqlite = new Database(path.resolve(process.cwd(), "sqlite.db"));
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) { values.role = user.role ?? ROLE_ADMIN; updateSet.role = values.role; }
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.active, 1)).orderBy(products.id);
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getApprovedReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.status, STATUS_APPROVED))).orderBy(desc(reviews.createdAt));
}

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(reviews).values(review);
  return result.lastInsertRowid;
}

export async function markReviewHelpful(id: number) {
  const db = await getDb();
  if (!db) return;
  const current = await db.select({ helpfulCount: reviews.helpfulCount }).from(reviews).where(eq(reviews.id, id)).limit(1);
  if (!current[0]) return;
  await db.update(reviews).set({ helpfulCount: current[0].helpfulCount + 1 }).where(eq(reviews.id, id));
}

export async function upsertNewsletterSubscriber(email: string, source = DEFAULT_NEWSLETTER_SOURCE) {
  const db = await getDb();
  if (!db) return;
  await db.insert(newsletterSubscribers).values({ email, source, status: STATUS_SUBSCRIBED }).onConflictDoUpdate({ target: newsletterSubscribers.email, set: { status: STATUS_SUBSCRIBED, source, updatedAt: new Date() } });
}

export async function createOrder(order: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(orders).values(order);
  const orderId = Number(result.lastInsertRowid);
  if (orderId && items.length) await db.insert(orderItems).values(items.map((item) => ({ ...item, orderId })));
  return orderId;
}
