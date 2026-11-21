/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["localhost", "vatsaai.com", "www.vatsaai.com", "vegetablemarketprice.com", "api.acropai.com", "acrop.app", "images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vegetablemarketprice.com",
      },
      {
        protocol: "https",
        hostname: "api.acropai.com",
      },
      {
        protocol: "https",
        hostname: "acrop.app",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
