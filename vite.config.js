import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/auth':          { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/ai':            { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/doctors':       { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/appointments':  { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/admin':         { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/alerts':        { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/notifications': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/prescriptions': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/static':        { target: 'http://127.0.0.1:8000', changeOrigin: true },
    }
  }
})

