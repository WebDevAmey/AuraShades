/// <reference types="vite/client" />
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import appCss from '~/styles.css?url'
import { SiteHeader } from '~/components/SiteHeader'
import { SiteFooter } from '~/components/SiteFooter'
import { organizationLd, SITE, websiteLd } from '~/lib/seo'
import { themeInitScript } from '~/lib/theme'
import { button } from '~/lib/button'


export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#0d0f14' },
      { property: 'og:site_name', content: SITE.name },
      { property: 'og:locale', content: 'en_US' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
    ],
    scripts: [organizationLd(), websiteLd()].map((j) => ({ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', ...j }) })),
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

export function RootLayout() {
  return (
    <div className="app">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { background: 'var(--panel)', color: 'var(--ink)', border: '1px solid var(--line)', fontFamily: 'var(--font-sans)' },
        }}
      />
    </div>
  )
}

export function NotFound() {
  return (
    <section className="wrap section flex min-h-[70vh] flex-col items-start justify-center gap-6">
      <h1 className="display text-[clamp(48px,8vw,104px)]">This page has no shader</h1>
      <p className="lede">The link may be old, or the page moved. The library has every background we ship.</p>
      <div className="flex flex-wrap gap-3">
        <Link to="/library" className={button({ variant: 'primary' })}>Browse the library</Link>
        <Link to="/" className={button({ variant: 'secondary' })}>Go to the home page</Link>
      </div>
    </section>
  )
}
