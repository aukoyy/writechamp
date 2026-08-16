import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a minimal .next/standalone folder for Docker (server.js + traced deps).
  output: "standalone",
};

export default nextConfig;
