/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Allowed origins for development
  allowedDevOrigins: ['192.168.100.24', 'localhost'],

  // ✅ Environment variables
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
    // ✅ Optimized package imports
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'chart.js',
      'react-hot-toast',
      '@tanstack/react-query',
    ],
    clientRouterFilter: true,
    clientRouterFilterRedirects: false,
    // ✅ Optimize CSS
    optimizeCss: true,
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
    minimumCacheTTL: 31536000, // 1 year
  },

  // ✅ Compression
  compress: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ✅ Source maps
  productionBrowserSourceMaps: false,

  // ✅ Output file tracing
  outputFileTracingIncludes: {
    '**/*': [
      'node_modules/jszip/**/*',
      'node_modules/@prisma/client/**/*',
    ],
  },

  // ✅ Empty array
  serverExternalPackages: [],

  // ✅ Remove x-powered-by header
  poweredByHeader: false,
}

module.exports = nextConfig