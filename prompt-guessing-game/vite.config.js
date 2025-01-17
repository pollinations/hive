import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/hive/prompt-guessing-game/',  // GitHub Pages path: username.github.io/hive/prompt-guessing-game
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    host: true
  }
})