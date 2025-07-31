// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'https://gaebang.site',
        changeOrigin: true,
        secure: true
      },
      '/login': {
        target: 'https://gaebang.site',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
