/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    // Allow images from any domain for client flexibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Supported image formats
    formats: ['image/avif', 'image/webp'],
  },

  // Experimental features for Next.js 15
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Trailing slash configuration
  trailingSlash: false,
}

module.exports = nextConfig
