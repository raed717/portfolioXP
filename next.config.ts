import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A package-lock.json in the parent folder confuses workspace-root inference.
  turbopack: { root: __dirname },
  images: {
    // Project screenshots and the avatar are hosted on Cloudinary (src/data/content).
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
