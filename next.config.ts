import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
  images: {
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com'],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
