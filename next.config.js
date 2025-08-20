/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration - no pages, no builds
  // This project is API-only for Vercel serverless functions
  
  // Disable everything
  output: undefined,
  generateStaticParams: undefined,
  
  // Just basic settings
  reactStrictMode: false,
  swcMinify: false,
  
  // Ignore all errors since we're not building pages
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

module.exports = nextConfig
