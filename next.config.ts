import type { NextConfig } from "next";

const CANONICAL_HOST = "raed.guembri.tn";

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
    return [
      { source: "/:path*", headers: securityHeaders },
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
