/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.100.24', 'localhost'],

  // ✅ Add optimization for development
  swcMinify: true,
  compress: true,

  // ✅ Reduce bundle size
  optimizeFonts: true,
  optimizeCss: true,

  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
    // ✅ Improve development performance
    optimizePackageImports: ['lucide-react', 'framer-motion', 'chart.js'],
  },

  // ✅ Exclude large packages from being watched
  watchOptions: {
    ignored: [
      '**/node_modules/**',
      '**/.next/**',
      '**/backups/**',
      '**/dist/**',
    ],
  },

  outputFileTracingIncludes: {
    '**/*': [
      'node_modules/jszip/**/*',
      'node_modules/@prisma/client/**/*',
    ],
  },

  serverExternalPackages: [],
}

module.exports = nextConfig