import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { nanoid } from "nanoid";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(keyBuffer, derivedKey);
}

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  
  register: publicProcedure.input(authSchema).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length > 0) throw new Error("Email already registered");
    
    const hashedPassword = hashPassword(input.password);
    const openId = nanoid(); // Generate a unique openId
    
    const result = await db.insert(users).values({
      email: input.email,
      password: hashedPassword,
      openId,
      loginMethod: "email",
    });
    
    // Automatically log in
    const cookieOptions = getSessionCookieOptions(ctx.req);
    // Normally we'd sign a JWT here. For simplicity, we just use openId as session token
    // In production, ALWAYS use a signed JWT or secure session store
    ctx.res.cookie(COOKIE_NAME, openId, cookieOptions);
    
    return { success: true };
  }),
  
  login: publicProcedure.input(authSchema).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length === 0 || !existing[0].password) {
      throw new Error("Invalid credentials");
    }
    
    const valid = verifyPassword(input.password, existing[0].password);
    if (!valid) throw new Error("Invalid credentials");
    
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.cookie(COOKIE_NAME, existing[0].openId, cookieOptions);
    
    return { success: true, openId: existing[0].openId };
  }),
  
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
