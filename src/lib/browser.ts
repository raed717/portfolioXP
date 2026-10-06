/**
 * Web Voyager rules (§11.7): only project URLs from src/data are loaded in frames.
 * Shared by the Browser app (client) and /api/embed-check (server, to prevent SSRF).
 */
import { projects } from "@/data";

export const HOME_URL = "about:home";

export type Demo = { slug: string; title: string; description: string; url: string; cover: string };

/** Projects with a live demo, shown on the browser's home page. */
export const DEMOS: Demo[] = projects
  .filter((p) => p.liveUrl)
  .map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    url: p.liveUrl!,
    cover: p.cover,
  }));

const ALLOWED = new Set(
  projects
    .flatMap((p) => [p.liveUrl, p.githubUrl])
    .filter(Boolean)
    .map((u) => normalize(u!)),
);

function normalize(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return url;
  }
}

export function isAllowed(url: string): boolean {
  return ALLOWED.has(normalize(url));
}

/** Adds https:// to bare hosts typed in the address bar. */
export function normalizeInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed || trimmed === HOME_URL) return HOME_URL;
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Google Drive "view" pages refuse framing but the /preview variant is designed for it. */
export function toEmbedUrl(url: string): string {
  const drive = url.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
  return drive ? `https://drive.google.com/file/d/${drive[1]}/preview` : url;
}

export function demoFor(url: string): Demo | undefined {
  return DEMOS.find((d) => normalize(d.url) === normalize(url));
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
