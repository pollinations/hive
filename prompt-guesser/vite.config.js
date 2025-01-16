import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const buildOutDir = process.env.BUILD_DIR || 'dist'
  
  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true
    },
    build: {
      outDir: buildOutDir,
      emptyOutDir: true
    }
  }
})
