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
    // ✅ Optimized package imports (already good)
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'chart.js',
      'react-hot-toast',
      '@tanstack/react-query',
    ],
    clientRouterFilter: true,
    clientRouterFilterRedirects: false,
    // ✅ NEW: Optimize CSS
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
    // ✅ Formats (already good)
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // ✅ NEW: Cache images for 1 year for better performance
    minimumCacheTTL: 31536000, // 1 year (was 60 seconds)
  },

  // ✅ Compression (already good)
  compress: true,

  compiler: {
    // ✅ Remove console in production (already good)
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ✅ Source maps (already good)
  productionBrowserSourceMaps: false,

  // ✅ Output file tracing (already good)
  outputFileTracingIncludes: {
    '**/*': [
      'node_modules/jszip/**/*',
      'node_modules/@prisma/client/**/*',
    ],
  },

  // ✅ Empty array (already good)
  serverExternalPackages: [],

  // ✅ NEW: Power optimizations
  poweredByHeader: false, // Remove x-powered-by header

  // ✅ NEW: On-demand entries for faster dev
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // ✅ NEW: Modularize imports for smaller bundles
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
    '@tanstack/react-query': {
      transform: '@tanstack/react-query/build/modern/{{member}}',
    },
  },

  // ✅ NEW: Optimize bundle size
  swcMinify: false, // Not supported in Next.js 16, but keep false

  // ✅ NEW: Traffic / routing
  trailingSlash: false,

  // ✅ NEW: Strict mode for better performance
  reactStrictMode: true,

  // ✅ NEW: Faster redirects
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
}

module.exports = nextConfig