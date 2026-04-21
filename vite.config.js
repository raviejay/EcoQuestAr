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
      registerType: "autoUpdate",
      manifest: {
        name: "EcoQuest AR",
        short_name: "EcoQuest",
        description:
          "AI-powered trash detection and gamified environmental engagement",
        theme_color: "#16a34a",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
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
