import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isProd ? basePath : '',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["novel"],
  },
};

export default nextConfig;
