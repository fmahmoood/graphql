// Import required Vite modules
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Export Vite configuration
export default defineConfig({
  // Add React plugin for JSX support
  plugins: [react()],
  base: '/graphql/',
  
  // Development server configuration
  server: {
    // Proxy configuration for API requests
    proxy: {
      // Match all /api/* requests
      '/api': {
        // Target URL with correct domain
        target: 'https://learn.reboot01.com',
        // Enable CORS
        changeOrigin: true,
        // Don't verify SSL certificate
        secure: false
      }
    }
  }
})