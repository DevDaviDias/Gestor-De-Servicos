import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

export default defineConfig({
  base: "./", // 🔥 ISSO AQUI resolve o layout quebrado em produção

  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        clientes: resolve(__dirname, "clientes.html"),
        relatorios: resolve(__dirname, "relatorios.html"),
        configuracoes: resolve(__dirname, "configuracoes.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
      },
    },
  },

  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,svg,ico}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "firebase-images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "firestore-cache",
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      manifest: {
        name: "Gestão de Serviços",
        short_name: "GestaoServ",
        description: "Gerenciador de serviços, garantias e lucros",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "./", // 👈 também importante em produção
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
