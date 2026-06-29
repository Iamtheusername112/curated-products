import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["cheerio"],
  serverActions: {
    bodySizeLimit: "100mb",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    middlewareClientMaxBodySize: "100mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.shein.com",
      },
      {
        protocol: "https",
        hostname: "img.ltwebstatic.com",
      },
      {
        protocol: "https",
        hostname: "**.ltwebstatic.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
  },
};

export default nextConfig;
