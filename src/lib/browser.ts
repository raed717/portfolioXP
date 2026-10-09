/**
 * Web Voyager rules (§11.7): only project URLs from src/data are loaded in frames.
 * Shared by the Browser app (client) and /api/embed-check (server, to prevent SSRF).
 */
import { projects } from "@/data";

export const HOME_URL = "about:home";

export type Demo = {
  slug: string;
  title: string;
  description: string;
  url: string;
  cover: string;
  liveUrl: string | null;
  videoUrl: string | null;
};

/** Projects with a live demo or video, shown on the browser's home page. */
export const DEMOS: Demo[] = projects
  .filter((p) => p.liveUrl || p.videoUrl)
  .map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    url: p.liveUrl ?? p.videoUrl!,
    cover: p.cover,
    liveUrl: p.liveUrl,
    videoUrl: p.videoUrl,
  }));

const ALLOWED = new Set(
  projects
    .flatMap((p) => [p.liveUrl, p.githubUrl, p.videoUrl])
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

export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.includes("/video/upload/");
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
  const norm = normalize(url);
  return DEMOS.find(
    (d) =>
      normalize(d.url) === norm ||
      (d.liveUrl !== null && normalize(d.liveUrl) === norm) ||
      (d.videoUrl !== null && normalize(d.videoUrl) === norm),
  );
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
