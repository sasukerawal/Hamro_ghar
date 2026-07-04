// server/utils/mailer.js
import { Resend } from "resend";

// Lazily constructed — a missing RESEND_API_KEY should only break the
// email-sending path, not crash the whole server at boot (the Resend
// constructor throws synchronously on a missing/empty key).
let resend = null;

// Resend sandbox sender — works out of the box, but only delivers to the
// email address the Resend account is signed up with. Verify a domain in
// the Resend dashboard and set RESEND_FROM_EMAIL to send to real users.
const FROM = process.env.RESEND_FROM_EMAIL || "HamroGhar <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html, text }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Email is not configured: RESEND_API_KEY is missing.");
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email via Resend");
  }

  return data;
}
