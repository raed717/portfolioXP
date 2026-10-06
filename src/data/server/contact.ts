/**
 * Private contact details. Server-only: importing this from a client component fails the build,
 * so the email/phone never reach the browser bundle (§11.7).
 */
import "server-only";
import contactJson from "../content/contact.private.json";

export const CONTACT_PRIVATE = contactJson as { email: string; phone: string };
