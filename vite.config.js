import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://gen-ai-backend-e331.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
