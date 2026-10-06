import type { MetadataRoute } from "next";
import { SITE_HOST, absoluteUrl } from "@/lib/site";

/**
 * AI search and assistant crawlers, named explicitly so the policy is a deliberate choice rather
 * than an inherited default: being cited by answer engines is a goal for a portfolio.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "FacebookBot",
  "meta-externalagent",
  "CCBot",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/api/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_HOST,
  };
}
