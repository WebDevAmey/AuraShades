/**
 * SEO and answer-engine helpers. Every route builds its head through `seo()`, so
 * titles, canonical URLs, social cards and structured data stay consistent.
 * Set VITE_SITE_URL at build time to your production origin.
 */
import { FAQS, PLANS } from '~/lib/content'
import { SHADERS, type ShaderDef } from '~/lib/shaders/library'

export const SITE = {
  name: 'AuraShades',
  url: ((import.meta.env?.VITE_SITE_URL as string | undefined) ?? 'https://aurashades.com').replace(/\/$/, ''),
  email: 'hello@aurashades.example',
  tagline: 'Live shader backgrounds for websites',
  description:
    'AuraShades is a library of live WebGL shader backgrounds for websites: gradient, grain, pastel, aurora, dither and ASCII. Tune the palette in the browser and copy a React component, GLSL or CSS.',
}

type JsonLd = Record<string, unknown>

export function seo(opts: { title: string; description: string; path: string; type?: 'website' | 'article'; jsonLd?: JsonLd[]; noindex?: boolean }) {
  const url = SITE.url + (opts.path === '/' ? '/' : opts.path)
  const image = `${SITE.url}/og.png`
  return {
    meta: [
      { title: opts.title },
      { name: 'description', content: opts.description },
      ...(opts.noindex ? [{ name: 'robots', content: 'noindex' }] : []),
      { property: 'og:type', content: opts.type ?? 'website' },
      { property: 'og:url', content: url },
      { property: 'og:title', content: opts.title },
      { property: 'og:description', content: opts.description },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'AuraShades: live shader backgrounds for websites' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: opts.title },
      { name: 'twitter:description', content: opts.description },
      { name: 'twitter:image', content: image },
    ],
    links: [{ rel: 'canonical', href: url }],
    scripts: (opts.jsonLd ?? []).map((j) => ({ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', ...j }) })),
  }
}

/* Structured data builders */

export const organizationLd = (): JsonLd => ({
  '@type': 'Organization',
  '@id': `${SITE.url}/#org`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/favicon.svg`,
  email: SITE.email,
})

export const websiteLd = (): JsonLd => ({
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  publisher: { '@id': `${SITE.url}/#org` },
})

export const softwareLd = (): JsonLd => ({
  '@type': 'SoftwareApplication',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any browser with WebGL',
  publisher: { '@id': `${SITE.url}/#org` },
  offers: PLANS.map((p) => ({
    '@type': 'Offer',
    name: p.name,
    price: String(p.monthly),
    priceCurrency: 'USD',
    description: p.pitch,
    url: `${SITE.url}/pricing`,
  })),
})

export const faqLd = (): JsonLd => ({
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

export const breadcrumbLd = (items: { name: string; path: string }[]): JsonLd => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE.url + it.path })),
})

export const libraryLd = (): JsonLd => ({
  '@type': 'CollectionPage',
  name: 'AuraShades shader library',
  url: `${SITE.url}/library`,
  description: `All ${SHADERS.length} AuraShades backgrounds, filterable by style and plan.`,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: SHADERS.length,
    itemListElement: SHADERS.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/library/${s.id}`, name: s.name })),
  },
})

export const shaderLd = (s: ShaderDef): JsonLd => ({
  '@type': 'SoftwareSourceCode',
  name: `${s.name} shader background`,
  url: `${SITE.url}/library/${s.id}`,
  description: `${s.summary} ${s.description}`,
  programmingLanguage: ['GLSL', 'TypeScript'],
  runtimePlatform: 'WebGL 1',
  isAccessibleForFree: s.tier === 'free',
  genre: s.style,
  publisher: { '@id': `${SITE.url}/#org` },
})

export const docsLd = (): JsonLd => ({
  '@type': 'TechArticle',
  headline: 'How to add a live shader background to a React site',
  description: 'Install AuraShades, add a shader background, and tune it with props.',
  url: `${SITE.url}/docs`,
  author: { '@id': `${SITE.url}/#org` },
  publisher: { '@id': `${SITE.url}/#org` },
  proficiencyLevel: 'Beginner',
  dependencies: 'React 18 or later',
})
