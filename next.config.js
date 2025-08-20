/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force API-only mode
  output: 'standalone',
  
  // Disable all page generation
  generateStaticParams: () => [],
  
  // Skip build checks
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Only process API routes
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude page components from server build
      config.externals = config.externals || [];
      config.externals.push(/^(?!.*\/api\/).*page\.(js|ts|jsx|tsx)$/);
    }
    return config;
  },
}

module.exports = nextConfig

module.exports = nextConfig
