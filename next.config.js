const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    {
      // API offres — NetworkFirst, TTL 15min
      urlPattern: /^https?.*\/api\/v1\/offres/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'baraka-offres',
        expiration: { maxEntries: 50, maxAgeSeconds: 900 },
        networkTimeoutSeconds: 5,
      },
    },
    {
      // API slider — StaleWhileRevalidate, TTL 1h
      urlPattern: /^https?.*\/api\/v1\/slider/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'baraka-slider',
        expiration: { maxEntries: 1, maxAgeSeconds: 3600 },
      },
    },
    {
      // Images R2/CDN — CacheFirst, TTL 1 an
      urlPattern: /^https?.*\.(webp|png|jpg|jpeg|svg)(\?.*)?$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'baraka-images',
        expiration: { maxEntries: 100, maxAgeSeconds: 31536000 },
      },
    },
    {
      // Pages Next.js — NetworkFirst avec fallback
      urlPattern: /^https?:\/\/[^/]+\/(accueil|besoin|resultats|simulateur|compte)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'baraka-pages',
        expiration: { maxEntries: 20, maxAgeSeconds: 86400 },
        networkTimeoutSeconds: 3,
      },
    },
  ],
})

module.exports = withBundleAnalyzer(withPWA({
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'cdn.tiviana.fr' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    minimumCacheTTL: 31536000,
  },
  allowedDevOrigins: ['192.168.11.103'],
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}))
