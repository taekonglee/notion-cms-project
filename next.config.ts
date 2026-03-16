import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash — 블로그 커버 이미지
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // GitHub raw content — 외부 이미지 호스팅
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      // Cloudinary — 이미지 CDN
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Notion 외부 이미지 (external 타입, 만료 없음)
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      // Notion 내부 파일 S3 (file 타입 — 만료 있음, notion-renderer에서 img 폴백 사용)
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
