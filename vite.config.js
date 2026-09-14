import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages serves project sites under /<repo>/, so the build needs that
// prefix on every asset URL. Local dev/preview keeps the root path.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Pure-Water-Filtration/' : '/',
  build: {
    outDir: 'docs',
  },
  plugins: [react()],
}))
