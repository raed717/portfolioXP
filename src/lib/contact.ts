/** Contact form schema shared by the Mail app (client) and /api/contact (server) — §11.7. */

export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot: hidden from humans, bots fill it. Must stay empty. */
  website: string;
  /** Milliseconds between the form rendering and submission; instant submits are bots. */
  elapsedMs: number;
};

export type ContactErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export const LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
  minMessage: 10,
} as const;
export const MIN_FILL_MS = 2000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(input: Partial<ContactInput>): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const subject = input.subject?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (!name) errors.name = "Please tell me your name.";
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`;

  if (!EMAIL_RE.test(email) || email.length > LIMITS.email)
    errors.email = "That email address doesn't look right.";

  if (subject.length > LIMITS.subject)
    errors.subject = `Keep it under ${LIMITS.subject} characters.`;

  if (message.length < LIMITS.minMessage) errors.message = "A few more words, please.";
  else if (message.length > LIMITS.message)
    errors.message = `Keep it under ${LIMITS.message} characters.`;

  return errors;
}

const BARE_ADDRESS = String.raw`[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+`;
const SENDER_RE = new RegExp(`^(?:${BARE_ADDRESS}|[^<>"]+\\s<${BARE_ADDRESS}>)$`);

/**
 * Normalizes an address from an environment variable. Hosting dashboards (e.g. Vercel) store
 * values verbatim, so quotes copied from a .env file or stray whitespace end up in the value.
 * Returns null when empty or not in `email@x.y` / `Name <email@x.y>` form.
 */
export function cleanEnvAddress(value: string | undefined): string | null {
  const cleaned = value
    ?.trim()
    .replace(/^(["'])([\s\S]*)\1$/, "$2")
    .trim();
  return cleaned && SENDER_RE.test(cleaned) ? cleaned : null;
}

/** True when the submission looks automated (honeypot filled or submitted too fast). */
export function looksLikeBot(input: Partial<ContactInput>): boolean {
  return Boolean(input.website) || (input.elapsedMs ?? 0) < MIN_FILL_MS;
}
