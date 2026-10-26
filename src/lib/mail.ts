import "server-only";

// Transactional mail through Resend's HTTP API (no SDK needed). Without RESEND_API_KEY the site
// still works: password reset links can then only be issued by the admin from /admin.

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.MAIL_FROM ?? "Ingenium <onboarding@resend.dev>";

export const mailEnabled = Boolean(apiKey);

/** Sends one email. Returns false when mail is not set up or the provider refused it. */
export async function sendMail(to: string, subject: string, text: string, html: string) {
  if (!apiKey) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error("Resend refused the email:", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("Resend request failed:", err);
    return false;
  }
}
