import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backend =
      process.env.ENGINE_BACKEND_URL ||
      (process.env.NEXT_PUBLIC_ENGINE_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_ENGINE_URL
        : null) ||
      (process.env.NODE_ENV === "production"
        ? "https://loffice-engine.onrender.com"
        : "http://localhost:9982");
    return [
      {
        source: "/engine/:path*",
        destination: `${backend.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
