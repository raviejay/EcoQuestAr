import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
   VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'logo.svg', 'logo2.png'],
  manifest: {
    name: 'EcoQuest AR',
    short_name: 'EcoQuest',
    description: 'AI-powered trash detection and gamified environmental engagement',
    theme_color: '#6EAE21',        // ← match your app green
    background_color: '#f0f7e6',   // ← match your app bg
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      { src: 'icons/logo2.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/logo3.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/logo2.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 300 }
        }
      },
      {
        urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'map-tiles',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }
        }
      }
    ]
  }
})
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    proxy: {
      // Proxy /roboflow/* → https://serverless.roboflow.com/*
      // This bypasses CORS because the request comes from Node, not the browser
      "/roboflow": {
        target: "https://serverless.roboflow.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roboflow/, ""),
        secure: true,
      },
    },
  },
});
