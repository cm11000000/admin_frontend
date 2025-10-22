/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const isStaticExport = process.env.STATIC_EXPORT === 'true'

const nextConfig = {
  reactStrictMode: true,

  // Enable SWC minification for faster builds
  swcMinify: true,

  // Strip console.* in production bundles (keeps error/warn)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Enable compression
  compress: true,

  // Optimize package imports for better tree-shaking and smaller bundles
  experimental: {
    optimizePackageImports: [
      'recharts',
      'lucide-react',
      'framer-motion',
      '@tanstack/react-query',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
  },

  // Conditionally enable static export for S3 builds
  output: isStaticExport ? 'export' : undefined,
  trailingSlash: true,

  images: {
    unoptimized: true,
    // Configure external image domains
    domains: [
      'localhost',
      'cdn.sabpaisa.com',
      'api.sabpaisa.com',
      'stgcobapi.sabpaisa.in',
      'staging-apis.13-204-100-160.sslip.io',
      'cobawsapi.sabpaisa.in',
      'reportapi.sabpaisa.in',
      'adminapi.sabpaisa.in',
      'paybylink.sabpaisa.in',
      'mobile-prodpoc.sabpaisa.in'
    ],
    // Modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Mobile-first device sizes for responsive images
    deviceSizes: [320, 375, 390, 414, 640, 750, 828, 1080, 1200, 1920],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache images for 60 seconds
    minimumCacheTTL: 60,
    // Allow SVG images with security policy
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable static image imports
    disableStaticImages: false,
  },

  // Configure webpack for better tree-shaking and optimization
  webpack: (config, { isServer }) => {
    // Improve module resolution
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx'],
      },
    };

    return config;
  },

  // Production build optimization
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint blocking the build. Lint issues will not fail builds.
    ignoreDuringBuilds: true,
  },

  // Enable PWA support for mobile-first experience
  poweredByHeader: false,

  // Mobile-first headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = withBundleAnalyzer(nextConfig)
