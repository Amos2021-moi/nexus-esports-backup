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