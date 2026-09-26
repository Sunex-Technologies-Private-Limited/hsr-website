import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
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

const registerSchema = authSchema.extend({
  name: z.string().min(2, "Name is required"),
});

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  
  register: publicProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length > 0) throw new Error("Email already registered");
    
    const hashedPassword = await bcrypt.hash(input.password, 12);
    const openId = nanoid(); // Generate a unique openId
    
    const result = await db.insert(users).values({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      openId,
      loginMethod: "email",
    });
    
    // Automatically log in using secure JWT
    const cookieOptions = getSessionCookieOptions(ctx.req);
    const sessionToken = await sdk.createSessionToken(openId, { name: input.name });
    ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
    
    return { success: true };
  }),
  
  login: publicProcedure.input(authSchema).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length === 0 || !existing[0].password) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }
    
    const valid = await bcrypt.compare(input.password, existing[0].password);
    if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    
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
  
  forgotPassword: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length === 0) {
      // Don't reveal if email exists, just return success
      return { success: true };
    }
    
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await db.update(users)
      .set({ resetToken: token, resetTokenExpiry: expiresAt })
      .where(eq(users.id, existing[0].id));
      
    const resetUrl = `https://hsrdigitalhub.com/reset-password?token=${token}`;
    
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY || "dummy");
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "HSR Support <support@hsrdigitalhub.com>",
          to: input.email,
          subject: "Reset your HSR Digital Hub password",
          html: `<p>Hello,</p><p>You requested to reset your password. Click the link below to set a new password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link will expire in 1 hour.</p><p>If you didn't request this, you can safely ignore this email.</p>`
        });
      } else {
        console.log(`[Dev] Reset password URL for ${input.email}: ${resetUrl}`);
      }
    } catch (err) {
      console.error("Failed to send reset email:", err);
    }
    
    return { success: true };
  }),
  
  resetPassword: publicProcedure.input(z.object({ token: z.string(), password: z.string().min(8) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    
    const existing = await db.select().from(users).where(eq(users.resetToken, input.token)).limit(1);
    if (existing.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token" });
    }
    
    const user = existing[0];
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Reset token has expired" });
    }
    
    const hashedPassword = await bcrypt.hash(input.password, 12);
    
    await db.update(users)
      .set({ password: hashedPassword, resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, user.id));
      
    return { success: true };
  }),
});
