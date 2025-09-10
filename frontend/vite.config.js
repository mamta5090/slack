import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [    tailwindcss(),react()],
   define: {
    // By default, Vite doesn't include shims for NodeJS/CJS globals.
    // This adds the global variable that simple-peer needs.
    'global': 'window',
  },
  resolve: {
    alias: {
      // This is the alias you need to handle the "util" module.
      util: 'util',
    },
  },
})
