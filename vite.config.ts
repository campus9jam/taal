import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  // Treat audio files as static assets (importable as URL strings)
  assetsInclude: ['**/*.mp3', '**/*.m4a', '**/*.ogg', '**/*.wav', '**/*.flac', '**/*.aac'],
  build: {
    // Raise the inline limit so small assets aren't base64-inlined (keep audio as files)
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Put audio files in a dedicated folder inside dist/assets/audio/
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? '';
          if (/\.(mp3|m4a|ogg|wav|flac|aac)$/.test(name)) {
            return 'assets/audio/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    // Needed for audio streaming during local dev
    headers: {
      'Accept-Ranges': 'bytes',
    }
  }
})
