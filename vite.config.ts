import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type HtmlTagDescriptor, type Plugin, type Rolldown } from 'vite'

// The gateway is served from the root of etaiprod.indiatimes.com, next to the
// product apps (/studio, /voice, /tcc, /marathon). Health checks are therefore
// same-origin in production; in dev we proxy them to the live host.
const LIVE_ORIGIN = 'https://etaiprod.indiatimes.com'
const proxiedPaths = [
  '/health',
  '/studio/',
  '/voice/api/health',
  '/minicrm/api/health',
  '/leadhub/healthz',
  '/tcc/health',
  '/marathon/health',
]

/** Lazy route chunks, keyed by pathname ('*' = any other path, i.e. the 404). */
const routeEntries: Record<string, string> = {
  '/apis': 'src/pages/ApisPage.tsx',
  '/status': 'src/pages/StatusPage.tsx',
  '*': 'src/pages/NotFoundPage.tsx',
}

/** Web fonts every route paints with on the first screen (matched against emitted file names). */
const preloadFonts = [/^figtree-latin-wght-normal-.*\.woff2$/]

/**
 * Build-only HTML tweaks:
 * - Route-aware modulepreload: a tiny inline script preloads the lazy chunk
 *   graph for the current pathname, so /apis and /status don't wait for the
 *   main bundle to run before requesting their own code.
 * - Preloads the first-screen web fonts so text paints in its final face.
 */
function gatewayHtml(): Plugin {
  let base = '/'
  return {
    name: 'gateway-html',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return
        const chunks = Object.values(bundle).filter(
          (c): c is Rolldown.OutputChunk => c.type === 'chunk',
        )
        const graph = (file: string, seen = new Set<string>()) => {
          const chunk = bundle[file]
          if (seen.has(file) || chunk?.type !== 'chunk') return seen
          seen.add(file)
          chunk.imports.forEach((dep) => graph(dep, seen))
          return seen
        }
        const initial = new Set(
          chunks.filter((c) => c.isEntry).flatMap((c) => [...graph(c.fileName)]),
        )

        const routes: Record<string, string[]> = {}
        for (const [route, source] of Object.entries(routeEntries)) {
          const chunk = chunks.find((c) => c.facadeModuleId?.endsWith(source))
          if (!chunk) continue
          routes[route] = [...graph(chunk.fileName)]
            .filter((file) => !initial.has(file))
            .map((file) => base + file)
        }

        const script =
          `(function(){var r=${JSON.stringify(routes)},p=location.pathname.replace(/\\/+$/,'')||'/',` +
          `f=p==='/'?0:r[p]||r['*'];f&&f.forEach(function(h){var l=document.createElement('link');` +
          `l.rel='modulepreload';l.crossOrigin='';l.href=h;document.head.appendChild(l)})})()`

        const fonts: HtmlTagDescriptor[] = Object.values(bundle)
          .filter(
            (a) =>
              a.type === 'asset' && preloadFonts.some((re) => re.test(path.basename(a.fileName))),
          )
          .map((a) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              crossorigin: '',
              href: base + a.fileName,
            },
            injectTo: 'head',
          }))

        return [...fonts, { tag: 'script', children: script, injectTo: 'head' }]
      },
    },
  }
}

const proxy = Object.fromEntries(
  proxiedPaths.map((p) => [p, { target: LIVE_ORIGIN, changeOrigin: true, secure: true }]),
)

export default defineConfig({
  plugins: [react(), tailwindcss(), gatewayHtml()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: { proxy },
  preview: { proxy },
  build: {
    // Avoid colliding with other apps' /assets on the shared root domain.
    assetsDir: '_gateway',
    target: 'es2022',
    cssCodeSplit: true,
    // Keep artwork out of the JS bundle: images load in parallel and cache on their own.
    assetsInlineLimit: (file) => (file.endsWith('.webp') ? false : undefined),
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // Framework code changes rarely; a separate chunk stays cached across deploys.
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
