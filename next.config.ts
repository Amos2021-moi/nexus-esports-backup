/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.100.24', 'localhost'],

  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'chart.js',
      'react-hot-toast',
      '@tanstack/react-query',
    ],
    clientRouterFilter: true,
    clientRouterFilterRedirects: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  compress: true,

  // ✅ REMOVED: swcMinify - not supported in Next.js 16

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  productionBrowserSourceMaps: false,

  outputFileTracingIncludes: {
    '**/*': [
      'node_modules/jszip/**/*',
      'node_modules/@prisma/client/**/*',
    ],
  },

  serverExternalPackages: [],
}

module.exports = nextConfig