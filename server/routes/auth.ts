import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { sdk } from "../_core/sdk";

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
    
    const hashedPassword = await bcrypt.hash(input.password, 12);
    const openId = nanoid(); // Generate a unique openId
    
    const result = await db.insert(users).values({
      email: input.email,
      password: hashedPassword,
      openId,
      loginMethod: "email",
    });
    
    // Automatically log in using secure JWT
    const cookieOptions = getSessionCookieOptions(ctx.req);
    const sessionToken = await sdk.createSessionToken(openId, { name: input.email });
    ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
    
    return { success: true };
  }),
  
  login: publicProcedure.input(authSchema).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length === 0 || !existing[0].password) {
      throw new Error("Invalid credentials");
    }
    
    const valid = await bcrypt.compare(input.password, existing[0].password);
    if (!valid) throw new Error("Invalid credentials");
    
    const cookieOptions = getSessionCookieOptions(ctx.req);
    const sessionToken = await sdk.createSessionToken(existing[0].openId, { name: existing[0].name || existing[0].email || "" });
    ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
    
    return { success: true, openId: existing[0].openId };
  }),
  
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
