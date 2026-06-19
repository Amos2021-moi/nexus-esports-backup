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

  // ✅ Only exclude heavy backup libraries, NOT Prisma Client
  outputFileTracingExcludes: {
    '**/*': [
      'node_modules/jszip/**/*',
      'node_modules/@vercel/blob/**/*',
      'node_modules/archiver/**/*',
      '**/backups/**/*',
    ],
  },

  // ✅ Ensure Prisma Client is included
  outputFileTracingIncludes: {
    '**/*': [
      'node_modules/@prisma/client/**/*',
      'node_modules/.prisma/client/**/*',
    ],
  },

  // ✅ Don't externalize Prisma Client (let it be bundled)
  serverExternalPackages: ['jszip', '@vercel/blob'],
}

module.exports = nextConfig