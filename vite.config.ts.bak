import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/markbook/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Mark Book',
        short_name: 'MarkBook',
        description: 'Offline-first gradebook for teachers',
        theme_color: '#0B1F5C',
        background_color: '#F2F6FE',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/markbook/',
        start_url: '/markbook/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Required for Android adaptive icons
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB to allow the lazy-loaded Excel chunk
        navigateFallback: '/markbook/index.html',
      },
    }),
  ],
  build: {
    target: 'es2015',
  },
})
