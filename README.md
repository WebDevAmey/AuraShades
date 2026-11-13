# AuraShades

Marketing site, shader library and live editor for AuraShades: 59 live WebGL shader backgrounds in twelve styles (gradient, grain, pastel, aurora, dither, ASCII, grid, light, liquid, texture, orbit, spectral).

Built with TanStack Start, React 19, Tailwind CSS 4, Motion, Radix, Sonner, Lucide and Paper Shaders.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static prerender of every page into dist/client
npm run typecheck
```

Node 22+ is recommended. `npm run build` prerenders all routes (home, library, every shader page, pricing, docs) and builds a Nitro server into `.output` (`npm start` runs it). On Vercel, Nitro picks the Vercel preset by itself, so no extra config is needed. `.output/public` is plain static files if you'd rather use a static host.

## SEO and answer engines

- Set `VITE_SITE_URL=https://your-domain.com` when you build. It feeds canonical URLs, social cards, structured data, `sitemap.xml`, `robots.txt` and `llms.txt`.
- Every route builds its head through `seo()` in `src/lib/seo.ts`: unique title and description, canonical link, Open Graph and Twitter cards with `public/og.jpg`, and JSON-LD (Organization, WebSite, SoftwareApplication with offers, FAQPage, CollectionPage, SoftwareSourceCode per shader, TechArticle, BreadcrumbList).
- `npm run build` first runs `scripts/gen-seo.ts`, which writes the sitemap, robots file and `llms.txt` from the same data the pages use.
- Only canonical pages are prerendered; filtered library views and anchors are excluded.

## Design tokens

`src/styles.css` follows a tiered token model (after the Nectar design system): primitives in oklch, seeds, semantic roles per theme, then component tokens derived with `color-mix(in oklch, …)`. Components use semantic or component tokens only. Button variants are defined with `cva` in `src/lib/button.ts`.

## Where things live

| Path | What it is |
| --- | --- |
| `src/lib/shaders/library.ts` | Every shader: name, style, plan, dark and light palettes and GLSL body |
| `src/lib/shaders/glsl.ts` | Shared GLSL helpers and the React / GLSL / CSS exporters |
| `src/lib/shaders/engine.ts` | One WebGL context that renders every background on the page and copies pixels into each canvas; skips offscreen views, honours reduced motion, supports pause |
| `src/components/AuraShade.tsx` | `<AuraShade shader="silk" params={…} />` — the React component |
| `src/components/ShaderEditor.tsx` | Palette, dials and code export panel |
| `src/components/Pricing.tsx` | Plans, monthly/yearly toggle, FAQ |
| `src/routes/` | `/`, `/library`, `/library/$shaderId`, `/pricing`, `/docs`, 404 |
| `src/styles.css` | Design tokens (dark-first, light via `data-theme="light"`), buttons, tiles, motion |

## Adding a shader

Add an entry to `SHADERS` in `src/lib/shaders/library.ts`. The body must define `vec3 shade()` and can use `uC0–uC3`, `uSpeed`, `uScale`, `uGrain`, `uCell`, and the helpers `T()`, `uvA()`, `uvN()`, `fbm()`, `ramp()`, `grain()`, `bayer8()`. It appears in the library, gets its own page and prerenders automatically.

## Still to connect

- **Checkout:** the Pro and Team buttons open an email to `hello@aurashades.example`. Swap in your payment provider's checkout links in `src/components/Pricing.tsx`.
- **Contact address and domain:** replace `hello@aurashades.example` and add a canonical URL / share image in `src/routes/__root.tsx`.
- **npm package:** the docs describe `aurashades` / `aurashades/react` and `setLicence()`. The component exists in this repo (`AuraShade`); publishing it as a package is a separate step.
- **Prices** ($12/mo, $96/yr, $36/mo) are placeholders to confirm.
