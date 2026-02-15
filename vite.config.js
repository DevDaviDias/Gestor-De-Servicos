import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  root: './', // Define a raiz
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        clientes: resolve(__dirname, 'clientes.html'),
        relatorios: resolve(__dirname, 'relatorios.html'),
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gestão de Serviços Profissional',
        short_name: 'GestaoServ',
        theme_color: '#3b82f6', 
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});