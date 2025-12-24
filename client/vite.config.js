import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for the video calling app
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173,
    // Proxy API requests to our backend during development
    // This avoids CORS issues when the frontend and backend are on different ports
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true, // Enable WebSocket proxying for Socket.IO
        changeOrigin: true
      }
    }
  },
  
  // Build optimization settings
  build: {
    // Target modern browsers for smaller bundle size
    target: 'esnext',
    // Output directory
    outDir: 'dist'
  }
})
