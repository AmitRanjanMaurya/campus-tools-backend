/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Hostinger frontend
  output: 'export',
  trailingSlash: true,
  
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Image optimization for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**',
      }
    ],
  },

  // Environment variables for API URLs
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://campus-tools-api.vercel.app',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://campustoolshub.com'
  },

  // React strict mode
  reactStrictMode: true,

  // Compiler options for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  }
}

module.exports = nextConfig
