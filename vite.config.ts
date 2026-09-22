import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this repo at /homegym/, so the production build needs
  // that base path; local dev keeps serving from the root.
  base: command === 'build' ? '/homegym/' : '/',
  plugins: [react()],
  server: {
    host: true,
  },
}))
