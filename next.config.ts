import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/engine/:path*",
        destination: "http://localhost:9982/:path*",
      },
    ];
  },
};

export default nextConfig;
