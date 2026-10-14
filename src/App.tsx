import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense, useEffect, useRef } from 'react'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  useLocation,
} from 'react-router'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SkipLink } from '@/components/layout/SkipLink'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import HomePage from '@/pages/HomePage'

const ApisPage = lazy(() => import('@/pages/ApisPage'))
const StatusPage = lazy(() => import('@/pages/StatusPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const queryClient = new QueryClient()

/**
 * After a client-side route change, move focus to <main> so screen readers
 * land on the new page and the clicked nav link doesn't keep focus (an arrow
 * key would otherwise rove to the next header link and show its ring).
 * The initial load is left alone so the skip link stays the first Tab stop.
 */
function useFocusMainOnNavigate() {
  const { pathname } = useLocation()
  const last = useRef(pathname)
  useEffect(() => {
    if (last.current === pathname) return
    last.current = pathname
    const main = document.getElementById('main')
    if (main && !main.contains(document.activeElement)) main.focus({ preventScroll: true })
  }, [pathname])
}

/**
 * Root layout. <main> is the page "sheet": it sits above the footer (z-1) and
 * ends in a rounded cap that overlaps the footer by 16px.
 */
function RootLayout() {
  useFocusMainOnNavigate()
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="relative z-[1] flex flex-col bg-bg outline-none">
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <Outlet />
        </Suspense>
        <div
          aria-hidden="true"
          className="-mb-4 h-16 rounded-b-[30px] border-b border-sf-tertiary bg-bg md:h-28 md:rounded-b-[40px]"
        />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'apis', element: <ApisPage /> },
      { path: 'status', element: <StatusPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
