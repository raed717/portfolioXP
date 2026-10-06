/**
 * POST /api/contact — server half of the Mail app (§11.7).
 * Validates, filters bots (honeypot + time trap), rate-limits per IP, then delivers via Resend.
 * Nothing is stored. Without RESEND_API_KEY: logs in development, 503 in production.
 */
import { CONTACT_PRIVATE } from "@/data/server/contact";
import { cleanEnvAddress, looksLikeBot, validateContact, type ContactInput } from "@/lib/contact";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const { ok, retryAfterMs } = limiter(ip);
  if (!ok) {
    return Response.json(
      { error: "Too many messages. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  let input: Partial<ContactInput>;
  try {
    input = (await request.json()) as Partial<ContactInput>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Pretend success so bots learn nothing.
  if (looksLikeBot(input)) return Response.json({ ok: true });

  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) return Response.json({ errors }, { status: 422 });

  const name = input.name!.trim();
  const email = input.email!.trim();
  const subject = input.subject?.trim() || `Portfolio message from ${name}`;
  const message = input.message!.trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] RESEND_API_KEY not set; message not sent:", { name, email, subject });
      return Response.json({ ok: true, dev: true });
    }
    return Response.json(
      { error: "The mail server is offline right now. Please reach out on GitHub instead." },
      { status: 503 },
    );
  }

  // Empty or malformed env values fall back (to) or fail loudly in the logs (from).
  const from = process.env.CONTACT_FROM_EMAIL
    ? cleanEnvAddress(process.env.CONTACT_FROM_EMAIL)
    : "Portfolio <onboarding@resend.dev>";
  const to = cleanEnvAddress(process.env.CONTACT_TO_EMAIL) ?? CONTACT_PRIVATE.email;
  if (!from) {
    console.error(
      "[contact] CONTACT_FROM_EMAIL is invalid. Use `Name <email@domain>` or `email@domain`, without quotes.",
    );
    return Response.json(
      { error: "The mail server is misconfigured. Please reach out on GitHub instead." },
      { status: 503 },
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    console.error("[contact] Resend failed:", res.status, await res.text());
    return Response.json(
      { error: "The message couldn't be delivered. Please try again later." },
      { status: 502 },
    );
  }
  return Response.json({ ok: true });
}
