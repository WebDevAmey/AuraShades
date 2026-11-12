/**
 * Writes public/sitemap.xml, public/robots.txt and public/llms.txt from the site's
 * own data, so they never drift from the pages. Runs before every build.
 */
import { writeFileSync } from 'node:fs'
import { freeCount, SHADERS, STYLES, styleList, Word, word } from '../src/lib/shaders/library'
import { FAQS, PLANS } from '../src/lib/content'

const SITE = (process.env.VITE_SITE_URL ?? 'https://aurashades.com').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

const pages = [
  { path: '/', priority: '1.0' },
  { path: '/library', priority: '0.9' },
  { path: '/pricing', priority: '0.8' },
  { path: '/docs', priority: '0.8' },
  ...SHADERS.map((s) => ({ path: `/library/${s.id}`, priority: '0.7' })),
]

writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`,
)

writeFileSync(
  'public/robots.txt',
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
)

writeFileSync(
  'public/llms.txt',
  `# AuraShades

> AuraShades is a library of live WebGL shader backgrounds for websites in ${word(STYLES.length)} styles: ${styleList()}. Tune the palette in the browser, then copy a React component, raw GLSL, or CSS palette tokens. ${Word(freeCount)} shaders are free; Pro unlocks all ${SHADERS.length} and the React component.

## Pages

- [Home](${SITE}/): what AuraShades is, a live editor, pricing and FAQ
- [Library](${SITE}/library): every shader, filterable by style and plan
- [Pricing](${SITE}/pricing): Free, Pro and Team plans with a feature comparison and licence terms
- [Docs](${SITE}/docs): install, the <AuraShade /> component props, performance and browser support

## Styles

${STYLES.map((s) => `- ${s.id}: ${s.blurb}`).join('\n')}

## Shaders

${SHADERS.map((s) => `- [${s.name}](${SITE}/library/${s.id}) (${s.style}, ${s.tier === 'pro' ? 'Pro' : 'Free'}): ${s.summary}`).join('\n')}

## Plans

${PLANS.map((p) => `- ${p.name}: ${p.monthly === 0 ? 'free' : `$${p.monthly} per month or $${p.yearly} per year`}. ${p.features.join('; ')}.`).join('\n')}

## FAQ

${FAQS.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}
`,
)

console.log(`[seo] sitemap (${pages.length} urls), robots.txt and llms.txt written for ${SITE}`)
