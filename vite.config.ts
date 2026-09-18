import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['drache.svg', 'audio/**/*', 'bilder/**/*'],
      manifest: {
        name: 'Lesedrache',
        short_name: 'Lesedrache',
        description: 'Lesen lernen mit dem Lesedrachen',
        lang: 'de',
        theme_color: '#120b26',
        background_color: '#120b26',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,mp3,webp,woff2}'],
      },
    }),
  ],
})
