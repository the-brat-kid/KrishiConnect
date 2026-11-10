/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["localhost", "vatsaai.com", "www.vatsaai.com", "vegetablemarketprice.com", "api.acropai.com", "acrop.app"],
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
    ],
  }
};

module.exports = nextConfig;
