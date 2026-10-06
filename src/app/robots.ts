import type { MetadataRoute } from "next";
import { SITE_HOST, absoluteUrl } from "@/lib/site";

/**
 * Everyone, including AI search crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…),
 * may read the portfolio: being cited by answer engines is a goal, not a risk.
 * Only API routes are excluded.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_HOST,
  };
}
