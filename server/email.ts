import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY || "re_test_123");

export async function sendOrderConfirmation(
  email: string,
  name: string,
  orderNumber: string,
  downloadLinks: { name: string; url: string }[]
) {
  if (!env.RESEND_API_KEY) {
    console.error("[Resend Error] RESEND_API_KEY is not configured.");
    throw new Error("Missing RESEND_API_KEY for transactional emails.");
  }

  const linksHtml = downloadLinks
    .map((link) => `<li><strong>${link.name}:</strong> <a href="${link.url}">Download / Access here</a></li>`)
    .join("");

  const { data, error } = await resend.emails.send({
    from: "HSR Digital Hub <orders@hsrdigitalhub.com>",
    to: email,
    subject: `Your order ${orderNumber} is confirmed!`,
    html: `
      <h1>Thank you for your purchase, ${name}!</h1>
      <p>Your payment for order ${orderNumber} was successful.</p>
      <p>Here are the links to access your digital products:</p>
      <ul>
        ${linksHtml}
      </ul>
      <p>If you have any issues, please reply to this email.</p>
    `,
  });

  if (error) {
    console.error("[Resend Error]:", error);
    throw new Error("Failed to send order confirmation email");
  }

  return data;
}
