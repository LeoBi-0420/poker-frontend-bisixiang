import type { NextConfig } from "next";

const PROD_BACKEND_URL = "https://poker-api-bisixiang.onrender.com";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/games",
        destination: "/tournaments",
        permanent: false,
      },
      {
        source: "/games/:id",
        destination: "/tournaments/:id",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const backendBaseUrl =
      process.env.API_BASE_URL ??
      process.env.BACKEND_API_URL ??
      (process.env.NODE_ENV === "production"
        ? PROD_BACKEND_URL
        : "http://127.0.0.1:8001");

    return [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
