import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'scontent.fhan3-4.fna.fbcdn.net',
      'scontent.fsgn5-9.fna.fbcdn.net',
      "scontent.fsgn8-3.fna.fbcdn.net",
      'localhost',
      'bevclock-production.up.railway.app',
      'encrypted-tbn0.gstatic.com',
      'placehold.co',
    ],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fhan3-4.fna.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fsgn5-9.fna.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fsgn8-3.fna.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'png.pngtree.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'quindio.gov.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'icones.pro',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bevclock-production.up.railway.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    
    // Thêm cấu hình để xử lý ảnh local
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Cấu hình để xử lý lỗi ảnh
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Bỏ qua một số trang khỏi static generation
  async redirects() {
    return [];
  },
  
  // Tắt static generation cho một số trang
  // async generateStaticParams() {
  //   return [];
  // },
};

export default nextConfig;
