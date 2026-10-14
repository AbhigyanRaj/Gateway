import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The gateway is served from the root of etaiprod.indiatimes.com, next to the
// product apps (/studio, /voice, /tcc, /marathon). Health checks are therefore
// same-origin in production; in dev we proxy them to the live host.
const LIVE_ORIGIN = 'https://etaiprod.indiatimes.com'
const proxiedPaths = [
  '/health',
  '/marathon/health',
  '/tcc/health',
  '/voice/api/health',
  '/studio/api/v1',
]

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    proxy: Object.fromEntries(
      proxiedPaths.map((p) => [p, { target: LIVE_ORIGIN, changeOrigin: true, secure: true }]),
    ),
  },
  preview: {
    proxy: Object.fromEntries(
      proxiedPaths.map((p) => [p, { target: LIVE_ORIGIN, changeOrigin: true, secure: true }]),
    ),
  },
  build: {
    // Avoid colliding with other apps' /assets on the shared root domain.
    assetsDir: '_gateway',
    target: 'es2022',
    cssCodeSplit: true,
  },
})
