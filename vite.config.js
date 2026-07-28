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
      '/doctors':       { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        bypass(req) {
          if (req.headers.accept?.includes('html')) return '/index.html';
        }
      },
      '/appointments':  { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        bypass(req) {
          if (req.headers.accept?.includes('html')) return '/index.html';
        }
      },
      '/admin':         { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        bypass(req) {
          if (req.headers.accept?.includes('html')) return '/index.html';
        }
      },
      '/alerts':        { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        bypass(req) {
          if (req.headers.accept?.includes('html')) return '/index.html';
        }
      },
      '/notifications': { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        bypass(req) {
          if (req.headers.accept?.includes('html')) return '/index.html';
        }
      },
      '/prescriptions': { 
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        bypass(req) {
          if (req.headers.accept?.includes('html')) return '/index.html';
        }
      },
      '/static':        { target: 'http://127.0.0.1:8000', changeOrigin: true },
    }
  }
})

