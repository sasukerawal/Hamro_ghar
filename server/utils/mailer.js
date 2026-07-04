// server/utils/mailer.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend sandbox sender — works out of the box, but only delivers to the
// email address the Resend account is signed up with. Verify a domain in
// the Resend dashboard and set RESEND_FROM_EMAIL to send to real users.
const FROM = process.env.RESEND_FROM_EMAIL || "HamroGhar <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html, text }) {
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
