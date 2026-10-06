/**
 * GET /api/embed-check?url=… → { embeddable: boolean }
 * Browsers don't expose X-Frame-Options to scripts, so the server peeks at the headers.
 * Only allow-listed project URLs are fetched (no open proxy / SSRF). Results are cached.
 */
import { isAllowed, toEmbedUrl } from "@/lib/browser";

const cache = new Map<string, { embeddable: boolean; expires: number }>();
const TTL_MS = 60 * 60 * 1000;

function framingAllowed(headers: Headers, origin: string): boolean {
  const xfo = headers.get("x-frame-options")?.toLowerCase();
  if (xfo && (xfo.includes("deny") || xfo.includes("sameorigin"))) return false;

  const csp = headers.get("content-security-policy")?.toLowerCase();
  const ancestors = csp?.match(/frame-ancestors([^;]*)/)?.[1]?.trim();
  if (ancestors !== undefined) {
    const sources = ancestors.split(/\s+/);
    if (sources.includes("'none'")) return false;
    if (!sources.includes("*") && !sources.some((s) => origin.startsWith(s.replace(/\/$/, "")))) {
      return false;
    }
  }
  return true;
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url") ?? "";
  if (!isAllowed(url)) return Response.json({ error: "Not an allowed URL." }, { status: 400 });

  const target = toEmbedUrl(url);
  const cached = cache.get(target);
  if (cached && cached.expires > Date.now())
    return Response.json({ embeddable: cached.embeddable });

  let embeddable = false;
  try {
    const res = await fetch(target, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 (PortfolioXP embed check)" },
    });
    embeddable = res.ok && framingAllowed(res.headers, new URL(request.url).origin);
    await res.body?.cancel();
  } catch {
    embeddable = false;
  }

  cache.set(target, { embeddable, expires: Date.now() + TTL_MS });
  return Response.json({ embeddable });
}
