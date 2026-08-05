import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Memastikan path asset relatif agar bisa dibuka di static server / dist
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor_react';
            if (id.includes('@supabase')) return 'vendor_supabase';
            if (id.includes('framer-motion')) return 'vendor_framer_motion';
            return 'vendor';
          }
        },
      },
    },
  },
})
