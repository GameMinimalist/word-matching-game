import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the static build works anywhere: GitHub Pages project
// pages, Netlify, a sub-path, or opened from any host. No hard-coded repo name.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
