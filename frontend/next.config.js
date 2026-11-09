/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["localhost", "vatsaai.com", "www.vatsaai.com", "vegetablemarketprice.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vegetablemarketprice.com",
      },
    ],
  }
};

module.exports = nextConfig;
