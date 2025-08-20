/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simplified API-only configuration
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  
  // Skip building pages, focus on API
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

module.exports = nextConfig
