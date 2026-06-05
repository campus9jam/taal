import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/lucide-react')) return 'icons';
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
