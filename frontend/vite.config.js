import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite : le serveur de développement tourne sur le port 5173
// et redirige les appels /api vers le backend Express (port 5000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
