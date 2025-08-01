import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'scontent.fhan3-4.fna.fbcdn.net',
      'scontent.fsgn5-9.fna.fbcdn.net',
      "scontent.fsgn8-3.fna.fbcdn.net",
      'localhost',
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
        hostname: 'graph.facebook.com',
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
    ],
    
    // Thêm cấu hình để xử lý ảnh local
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Bỏ qua một số trang khỏi static generation
  async redirects() {
    return [];
  },
  
  // Tắt static generation cho một số trang
  async generateStaticParams() {
    return [];
  },
};

export default nextConfig;
