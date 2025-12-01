import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [ 'true', 'localhost', '127.0.0.1', '0.0.0.0', 'ngrok', 'localhost:3001', 'actiniform-complexionally-rosa.ngrok-free.dev'],
    proxy: {
      // string shorthand: http://localhost:5173/api/login -> http://localhost:3001/api/login
      '/api': 'http://localhost:3002',
    }
  }
})