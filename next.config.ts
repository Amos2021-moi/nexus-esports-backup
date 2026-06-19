/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.100.24', 'localhost'],
  
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // ✅ Turbopack configuration
  turbopack: {},

  // ✅ Server actions configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // ✅ Exclude heavy packages from serverless functions
  serverExternalPackages: ['@prisma/client', 'jszip'],
}

module.exports = nextConfig