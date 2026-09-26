import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

export const contactRouter = router({
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      orderNumber: z.string().optional(),
      subject: z.string().min(1),
      message: z.string().min(5),
      honeypot: z.string().optional() // Anti-spam
    }))
    .mutation(async ({ input }) => {
      // Honeypot check
      if (input.honeypot) {
        // Silent success for bots
        return { success: true };
      }

      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY || "dummy");
        
        // Basic HTML escaping
        const escapeHtml = (unsafe: string) => {
          return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
        };

        const safeName = escapeHtml(input.name);
        const safeEmail = escapeHtml(input.email);
        const safeOrder = input.orderNumber ? escapeHtml(input.orderNumber) : "N/A";
        const safeSubject = escapeHtml(input.subject);
        const safeMessage = escapeHtml(input.message).replace(/\n/g, '<br/>');

        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: "HSR Website Contact Form <support@hsrdigitalhub.com>",
            to: process.env.SUPPORT_EMAIL || "hsrdigitalhub@gmail.com",
            replyTo: input.email,
            subject: `Contact Form: ${safeSubject}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Order Number:</strong> ${safeOrder}</p>
              <p><strong>Subject:</strong> ${safeSubject}</p>
              <br/>
              <h3>Message:</h3>
              <p>${safeMessage}</p>
            `
          });
        } else {
          console.log(`[Dev] Contact form submission from ${safeEmail}: ${safeMessage}`);
        }
        return { success: true };
      } catch (err) {
        console.error("Failed to send contact email:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send message. Please try again later." });
      }
    }),
});
