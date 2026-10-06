import type { NextConfig } from "next";
import projectsJson from "./src/data/content/projects.json";

const CANONICAL_HOST = "raed.guembri.tn";

/** Origins Web Voyager may frame: live demos flagged available in projects.json, plus Drive previews. */
const frameOrigins = [
  ...new Set([
    "https://drive.google.com",
    ...projectsJson.projects
      .filter((p) => p.live_available === true && p.live && p.live !== "#")
      .map((p) => new URL(p.live as string).origin),
  ]),
];

/**
 * Production CSP. 'unsafe-inline' scripts are required by Next's inline bootstrap without nonces
 * (nonces would force every page to render dynamically); everything else is locked to known origins.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'self'",
  `frame-src 'self' ${frameOrigins.join(" ")}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // A package-lock.json in the parent folder confuses workspace-root inference.
  turbopack: { root: __dirname },
  images: {
    // Project screenshots and the avatar are hosted on Cloudinary (src/data/content).
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },

  // One canonical host: www.raed.guembri.tn permanently redirects to raed.guembri.tn.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${CANONICAL_HOST}` }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
    ];
  },

  async headers() {
    // Dev needs eval for React Refresh, so the CSP is production-only.
    const csp =
      process.env.NODE_ENV === "production"
        ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
        : [];
    return [
      { source: "/:path*", headers: [...securityHeaders, ...csp] },
      // Vercel preview/deployment URLs must never compete with the real domain in search.
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<sub>.*)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
