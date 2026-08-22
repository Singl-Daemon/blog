import type { NextConfig } from "next";

const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  assetPrefix: basePath,
  experimental: {
    optimizePackageImports: [
      "@fluentui/react-components",
      "@fluentui/react-icons",
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
