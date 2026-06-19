/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.100.24', 'localhost'],
  
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  turbopack: {},

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // ✅ Exclude heavy packages from all serverless functions
  outputFileTracingExcludes: {
    '**/*': [
      'node_modules/.prisma/client/**/*',
      'node_modules/jszip/**/*',
      'node_modules/@vercel/blob/**/*',
      'node_modules/archiver/**/*',
    ],
  },

  // ✅ Mark packages as external to prevent bundling
  serverExternalPackages: ['@prisma/client', 'jszip', '@vercel/blob'],
}

module.exports = nextConfig