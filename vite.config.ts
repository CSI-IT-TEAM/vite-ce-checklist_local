import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,   // hoặc '0.0.0.0'
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://vjweb.dskorea.com:9091',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})


