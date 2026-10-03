import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` is '/' for local dev, `npm run preview`, and Vercel (served from root).
// GitHub Pages serves a project site from /<repo>/, so the Pages CI workflow
// sets BASE_PATH to that subpath before building.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
