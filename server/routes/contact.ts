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
        
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: "HSR Website Contact Form <support@hsrdigitalhub.com>",
            to: process.env.SUPPORT_EMAIL || "hsrdigitalhub@gmail.com",
            replyTo: input.email,
            subject: `Contact Form: ${input.subject}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${input.name}</p>
              <p><strong>Email:</strong> ${input.email}</p>
              <p><strong>Order Number:</strong> ${input.orderNumber || "N/A"}</p>
              <p><strong>Subject:</strong> ${input.subject}</p>
              <br/>
              <h3>Message:</h3>
              <p>${input.message.replace(/\n/g, '<br/>')}</p>
            `
          });
        } else {
          console.log(`[Dev] Contact form submission from ${input.email}: ${input.message}`);
        }
        return { success: true };
      } catch (err) {
        console.error("Failed to send contact email:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send message. Please try again later." });
      }
    }),
});
