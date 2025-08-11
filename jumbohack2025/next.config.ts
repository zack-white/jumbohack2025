import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint errors during `next build`
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip TypeScript type errors during `next build`
  // (use sparingly—this hides all TS errors at build time)
  typescript: {
    ignoreBuildErrors: true,
  },

  /* other Next.js config options here */
};

export default nextConfig;
