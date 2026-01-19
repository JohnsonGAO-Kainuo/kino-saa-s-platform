/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  // Reduce bundle size
  swcMinify: true,
}

export default nextConfig
