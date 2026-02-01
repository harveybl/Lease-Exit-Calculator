import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Lease-Exit-Calculator',
  // Empty turbopack config to suppress webpack migration warning
  turbopack: {},
};

export default nextConfig;
