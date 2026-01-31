import type { NextConfig } from "next";
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== 'production', // Disable except in production (Serwist doesn't support Turbopack)
})

const nextConfig: NextConfig = {
  // Empty turbopack config to suppress webpack migration warning
  turbopack: {},
};

export default withSerwist(nextConfig);
