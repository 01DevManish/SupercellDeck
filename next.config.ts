import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Supercell API se aane wali images ke domain ko allow karein
    domains: ['api-assets.clashroyale.com'],
  },
};

export default nextConfig;
