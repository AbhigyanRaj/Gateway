import '@fontsource-variable/figtree/wght.css'
import '@fontsource-variable/newsreader/opsz.css'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import '@/styles/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App'

// Enables JS-gated scroll reveals (content is never hidden without JS).
document.documentElement.classList.add('js')

// index.html carries default <title>/description/og tags for crawlers that
// don't run JS. Each route renders its own (React 19 hoists them into <head>),
// so drop the defaults first to avoid duplicates.
document.head.querySelectorAll('[data-route-meta]').forEach((el) => el.remove())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
