import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Use our custom sw.ts — plugin injects the precache manifest into it
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',

      // We call registerSW ourselves via the useRegisterSW hook
      injectRegister: null,

      // Prompt the user before activating a new SW version
      registerType: 'prompt',

      // We manage manifest.json manually in public/
      manifest: false,

      injectManifest: {
        // Precache all build artefacts
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },

      devOptions: {
        // Enable the SW in dev so push/cache can be tested locally
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
