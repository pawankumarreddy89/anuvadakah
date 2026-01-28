import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    // Fix for pdf-parse in server-side code
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdf-parse': 'pdf-parse/lib/pdf-parse.js',
      };
    }
    return config;
  },
};

export default nextConfig;
