"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AppProps } from "@/apps/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { person } from "@/data";
import { LIMITS, validateContact, type ContactErrors } from "@/lib/contact";
import { showMessage } from "@/lib/launcher";
import { useWindows } from "@/store/windows";
import styles from "./mail.module.css";

type Status = "idle" | "sending";

/**
 * Contact form styled as a mail composer (§6). "To" is prefilled with the owner's name only;
 * the address stays on the server. Nothing typed here is persisted (§11.6).
 */
export default function MailApp({ windowId }: AppProps) {
  const close = useWindows((s) => s.close);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const openedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Time trap: bots submit instantly after load; people take a few seconds at least.
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const payload = { ...data, elapsedMs: Date.now() - openedAt.current };

    const found = validateContact(payload);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length > 0) {
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        errors?: ContactErrors;
        error?: string;
        dev?: boolean;
      };
      if (res.ok) {
        close(windowId);
        if (body.dev) {
          showMessage(
            "Development mode",
            "The message passed validation and was logged on the server, but not emailed. Set RESEND_API_KEY to deliver it.",
            "warning",
          );
        } else {
          showMessage(
            "Message sent",
            `Thanks! Your message is on its way to ${person.name.split(" ")[0]}. Expect a reply in your inbox.`,
            "info",
          );
        }
        return;
      }
      if (body.errors) setErrors(body.errors);
      setServerError(body.error ?? "Something went wrong. Please try again.");
    } catch {
      setServerError("You seem to be offline. Check your connection and try again.");
    } finally {
      setStatus("idle");
    }
  }

  const fieldProps = (name: keyof ContactErrors) => ({
    name,
    id: `${windowId}-${name}`,
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": errors[name] ? `${windowId}-${name}-error` : undefined,
  });

  const fieldError = (name: keyof ContactErrors) =>
    errors[name] && (
      <span id={`${windowId}-${name}-error`} className={styles.error} role="alert">
        {errors[name]}
      </span>
    );

  return (
    <form ref={formRef} className={styles.composer} onSubmit={onSubmit} noValidate>
      <div className={styles.toolbar}>
        <Button type="submit" disabled={status === "sending"} className={styles.send}>
          <Icon name="mail" size={16} />
          {status === "sending" ? "Sending…" : "Send"}
        </Button>
        <Button type="button" onClick={() => close(windowId)}>
          Discard
        </Button>
      </div>

      <div className={styles.headers}>
        <span className={styles.label}>To:</span>
        <span className={styles.recipient}>
          <Icon name="user-guest" size={16} />
          {person.name}
        </span>

        <label className={styles.label} htmlFor={`${windowId}-name`}>
          From:
        </label>
        <div className={styles.field}>
          <input
            {...fieldProps("name")}
            className={styles.input}
            placeholder="Your name"
            autoComplete="name"
            maxLength={LIMITS.name}
            required
          />
          {fieldError("name")}
        </div>

        <label className={styles.label} htmlFor={`${windowId}-email`}>
          Reply to:
        </label>
        <div className={styles.field}>
          <input
            {...fieldProps("email")}
            type="email"
            className={styles.input}
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={LIMITS.email}
            required
          />
          {fieldError("email")}
        </div>

        <label className={styles.label} htmlFor={`${windowId}-subject`}>
          Subject:
        </label>
        <div className={styles.field}>
          <input
            {...fieldProps("subject")}
            className={styles.input}
            placeholder="Let's build something"
            maxLength={LIMITS.subject}
          />
          {fieldError("subject")}
        </div>
      </div>

      {/* Honeypot: invisible to people and assistive tech; bots tend to fill every field. */}
      <div className={styles.honeypot} aria-hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={styles.body}>
        <label htmlFor={`${windowId}-message`} className="sr-only-live">
          Message
        </label>
        <textarea
          {...fieldProps("message")}
          className={styles.message}
          placeholder="Write your message here…"
          maxLength={LIMITS.message}
          required
        />
        {fieldError("message")}
      </div>

      {serverError && (
        <p className={styles.serverError} role="alert">
          <Icon name="error" size={16} />
          {serverError}
        </p>
      )}
    </form>
  );
}
