import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {},
  // Force webpack config for builds that use webpack instead of turbopack
  webpack: (config, { isServer }) => {
    // Force pdf-parse to use CJS build in webpack builds
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdf-parse': require.resolve('pdf-parse/dist/pdf-parse/cjs/index.cjs'),
      };
    }
    return config;
  },
  // Force Vercel to use latest code
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
