import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/blog/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        // Vercel Blob storage
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    // Allow local API routes with query strings (for Google Places photo proxy)
    localPatterns: [
      {
        pathname: "/api/**",
        search: "",
      },
      {
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
