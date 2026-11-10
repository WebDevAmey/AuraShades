import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { routeTree } from '../src/routeTree.gen'
import '@fontsource/funnel-display/latin-500.css'
import '@fontsource/funnel-display/latin-600.css'
import '@fontsource/funnel-sans/latin-400.css'
import '@fontsource/funnel-sans/latin-500.css'
import '@fontsource/funnel-sans/latin-600.css'
import '@fontsource/geist-mono/latin-400.css'
import '../src/styles.css'
import { themeInitScript } from '../src/lib/theme'


// Same pre-paint theme resolution as the real site.
new Function(themeInitScript)()

const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ['/'] }),
  scrollRestoration: true,
  defaultViewTransition: true,
})
// Memory history keeps the page at one URL, so reset scroll on every navigation.
router.subscribe('onResolved', ({ toLocation }) => {
  if (toLocation.hash) document.getElementById(toLocation.hash)?.scrollIntoView()
  else window.scrollTo(0, 0)
})

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
