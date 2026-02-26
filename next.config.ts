import type { NextConfig } from "next";

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
      process.env.BACKEND_API_URL ?? "http://127.0.0.1:8001";

    return [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
