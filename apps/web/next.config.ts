import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "coffeehq.coffee",
    "www.coffeehq.coffee",
    "192.168.0.111",
    "192.168.0.116",
  ],
  serverExternalPackages: ["unzipper"],
  experimental: {
    serverActions: {
      bodySizeLimit: "51mb",
    },
  },
};

export default nextConfig;
