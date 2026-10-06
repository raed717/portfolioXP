import { describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "@/lib/rateLimit";
import { cleanEnvAddress, looksLikeBot, validateContact } from "@/lib/contact";

vi.mock("server-only", () => ({}));

const valid = {
  name: "Ada",
  email: "ada@example.com",
  subject: "Hello",
  message: "I'd love to talk about a role.",
  website: "",
  elapsedMs: 5000,
};

const post = (body: unknown, ip = "1.1.1.1") =>
  new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });

describe("contact validation", () => {
  it("accepts a valid message and flags each bad field", () => {
    expect(validateContact(valid)).toEqual({});
    const errors = validateContact({ name: "", email: "nope", message: "hi" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
  });

  it("treats honeypot or instant submits as bots", () => {
    expect(looksLikeBot(valid)).toBe(false);
    expect(looksLikeBot({ ...valid, website: "spam.biz" })).toBe(true);
    expect(looksLikeBot({ ...valid, elapsedMs: 100 })).toBe(true);
  });
});

describe("cleanEnvAddress", () => {
  it("strips quotes and whitespace that hosting dashboards keep verbatim", () => {
    expect(cleanEnvAddress('"Raed Guembri Portfolio <contact@guembri.tn>"')).toBe(
      "Raed Guembri Portfolio <contact@guembri.tn>",
    );
    expect(cleanEnvAddress("  'contact@guembri.tn'\n")).toBe("contact@guembri.tn");
    expect(cleanEnvAddress("Name <a@b.co>")).toBe("Name <a@b.co>");
  });

  it("rejects empty or malformed values", () => {
    expect(cleanEnvAddress(undefined)).toBeNull();
    expect(cleanEnvAddress("")).toBeNull();
    expect(cleanEnvAddress('"')).toBeNull();
    expect(cleanEnvAddress("Portfolio contact@guembri.tn")).toBeNull();
    expect(cleanEnvAddress("Name <not-an-email>")).toBeNull();
  });
});

describe("rate limiter", () => {
  it("blocks after the limit until the window resets", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 1).ok).toBe(true);
    expect(check("a", 2)).toEqual({ ok: false, retryAfterMs: 998 });
    expect(check("b", 2).ok).toBe(true);
    expect(check("a", 1001).ok).toBe(true);
  });
});

describe("POST /api/contact", () => {
  it("rejects invalid input with field errors", async () => {
    const { POST } = await import("./contact/route");
    const res = await POST(post({ ...valid, email: "bad" }, "2.2.2.2"));
    expect(res.status).toBe(422);
    expect((await res.json()).errors.email).toBeDefined();
  });

  it("silently accepts bots without sending", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { POST } = await import("./contact/route");
    const res = await POST(post({ ...valid, website: "x" }, "3.3.3.3"));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("rate-limits repeated submissions from one IP", async () => {
    const { POST } = await import("./contact/route");
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await POST(post(valid, "4.4.4.4"))).status);
    expect(statuses.at(-1)).toBe(429);
  });
});

describe("GET /api/embed-check", () => {
  it("refuses URLs that aren't project links", async () => {
    const { GET } = await import("./embed-check/route");
    const res = await GET(new Request("http://localhost/api/embed-check?url=https://evil.example"));
    expect(res.status).toBe(400);
  });
});
