import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 3213,
    },
    proxy: {
      '/api': {
        target: 'http://reverse-proxy:8080',
        changeOrigin: true,
      },
    },
  },
  preview: { port: 5173 },
})
