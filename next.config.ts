import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove X-Powered-By header for security + fewer bytes
  poweredByHeader: false,
  // Enable Brotli/gzip compression for all responses
  compress: true,
  // Allow Next.js Image optimization for remote sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
