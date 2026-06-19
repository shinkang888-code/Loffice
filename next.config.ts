import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const engine =
      process.env.NEXT_PUBLIC_ENGINE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://loffice-engine.onrender.com"
        : "http://localhost:9982");
    return [
      {
        source: "/engine/:path*",
        destination: `${engine}/:path*`,
      },
    ];
  },
};

export default nextConfig;
