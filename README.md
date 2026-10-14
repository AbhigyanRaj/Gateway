# ET AI Labs gateway

The front door to every ET AI product. One page maps the six products (AI Creative Studio first), lists their APIs, and shows live service health.

| Route | What it is |
|---|---|
| `/` | Landing page: hero, product showcase, product cards, API picker, live status, CTA |
| `/apis` | API directory: base URLs, health URLs, auth notes, docs, copy buttons |
| `/status` | Live status for every service, refreshed every 30s |
| anything else | 404 |

## Products

| Product | Console | API base | Health |
|---|---|---|---|
| AI Creative Studio | `/studio/` | `/studio/api/v1/` (sign-in required) | `/studio/` (console page) |
| AI Calling Bot | `/voice/` | `/voice/api/` | `/voice/api/health` |
| MiniCRM | `/minicrm/` | `/minicrm/api/` | `/minicrm/api/health` |
| LeadHub | `/leadhub/` | none (web app) | `/leadhub/healthz` |
| TCC Video Verification | `/tcc/` (tester), `/tcc/docs` | `/tcc/` | `/tcc/health` |
| Marathon Chatbot | API only | `/marathon/` | `/marathon/health` |
| Gateway server | | | `/health` |

Every product, along with its copy, links, accent colour and health path, is defined in **`src/data/products.ts`**. Edit that one file to change names, descriptions or URLs.

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), React Router, TanStack Query, lucide icons and motion. The fonts (Figtree, Newsreader, DM Mono) are self-hosted through Fontsource.

The visual system (tokens, type scale, components, motion) is ported from the reference design kit into `src/styles/index.css` as a Tailwind v4 `@theme`.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

The dev server proxies the health endpoints to `https://etaiprod.indiatimes.com`, so live status works locally.

To preview failure states in dev, add `?simulate=voice:down,tcc:degraded` to the URL.

```bash
npm run build        # type-check + production build into dist/
npm run preview      # serve dist/ (health proxied too)
npm run lint         # oxlint, warnings fail
npm run format       # prettier
```

## Deploy

The gateway is built to be served from the **root** of `etaiprod.indiatimes.com`, next to the product apps:

- **Health checks are same-origin.** Several health endpoints don't send CORS headers, so they can only be read from that origin.
- **Built assets go to `/_gateway/`.** They can't collide with any product app's `/assets/`.
- **The SPA fallback must cover only the gateway's own routes.** The product paths must keep routing to their apps.

Example nginx config:

```nginx
# Product apps and APIs stay exactly as they are (existing locations):
#   /studio/  /voice/  /minicrm/  /leadhub/  /tcc/  /marathon/  /health

# Gateway static build
root /var/www/gateway/dist;

location /_gateway/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Gateway routes (and unknown paths) fall back to the SPA
location = / { try_files /index.html =404; }
location = /apis { try_files /index.html =404; }
location = /status { try_files /index.html =404; }
location / { try_files $uri /index.html; }
```

## Artwork

Product art, icon tiles (transparent), the showcase panel, the footer texture and the OG background are original images. They were generated with the OpenAI and Gemini image models, and the best candidate per slot was kept. The optimised picks live in `src/assets/art/`.

To regenerate:

```bash
cp .env.example .env.local   # add OPENAI_API_KEY and GEMINI_API_KEY
node --env-file=.env.local scripts/generate-art.mjs [slot...]
node scripts/optimize-art.mjs
```

The keys are only read by these Node scripts. They are never prefixed with `VITE_` and never reach the browser bundle. `.env.local` and `art-candidates/` are gitignored.

## Project layout

```
src/
  data/products.ts        products, URLs, accents (single source of truth)
  lib/health.ts           health checks, status classification, session history
  hooks/useHealth.ts      shared 30s polling (TanStack Query)
  styles/index.css        design tokens + kit utilities (Tailwind v4 @theme)
  components/
    brand/                wordmark, emblem, ornament
    layout/               header (mega menu, mobile drawer), footer
    sections/             home page sections
    product/              cards, rows, status chips, code block
    primitives/           container, section, headings
    ui/                   shadcn components (kit-styled)
  pages/                  Home, APIs, Status, 404
```
