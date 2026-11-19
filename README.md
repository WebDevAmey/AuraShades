# AuraShades

Open source shader library, live editor and site for AuraShades: 90 live WebGL shader backgrounds in fourteen styles (gradient, grain, pastel, aurora, dither, ASCII, grid, light, liquid, texture, orbit, spectral, landscape, wave).

Built with TanStack Start, React 19, Tailwind CSS 4, Motion, Radix, Sonner, Lucide and Paper Shaders.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static prerender of every page into dist/client
npm run typecheck
```

Node 22+ is recommended. `npm run build` prerenders all routes (home, library, every shader page, docs, changelog) and builds a Nitro server into `.output` (`npm start` runs it). On Vercel, Nitro picks the Vercel preset by itself, so no extra config is needed. `.output/public` is plain static files if you'd rather use a static host.

## SEO and answer engines

- Set `VITE_SITE_URL=https://your-domain.com` when you build. It feeds canonical URLs, social cards, structured data, `sitemap.xml`, `robots.txt` and `llms.txt`.
- Every route builds its head through `seo()` in `src/lib/seo.ts`: unique title and description, canonical link, Open Graph and Twitter cards with `public/og.jpg`, and JSON-LD (Organization, WebSite, SoftwareApplication (free, MIT), FAQPage, CollectionPage, SoftwareSourceCode per shader, TechArticle, BreadcrumbList).
- `npm run build` first runs `scripts/gen-seo.ts`, which writes the sitemap, robots file and `llms.txt` from the same data the pages use.
- Only canonical pages are prerendered; filtered library views and anchors are excluded.

## Design tokens

`src/styles.css` follows a tiered token model (after the Nectar design system): primitives in oklch, seeds, semantic roles per theme, then component tokens derived with `color-mix(in oklch, …)`. Components use semantic or component tokens only. Button variants are defined with `cva` in `src/lib/button.ts`.

## Where things live

| Path | What it is |
| --- | --- |
| `src/lib/shaders/library.ts` | Every shader: name, style, dark and light palettes and GLSL body |
| `src/lib/shaders/glsl.ts` | Shared GLSL helpers and the React / GLSL / CSS exporters |
| `src/lib/shaders/engine.ts` | One WebGL context that renders every background on the page and copies pixels into each canvas; skips offscreen views, honours reduced motion, supports pause |
| `src/components/AuraShade.tsx` | `<AuraShade shader="silk" params={…} />` — the React component |
| `src/components/ShaderEditor.tsx` | Palette, dials and code export panel |
| `src/components/Faq.tsx` | FAQ accordion |
| `src/lib/changelog.ts` | Release notes shown on `/changelog` |
| `src/routes/` | `/`, `/library`, `/library/$shaderId`, `/docs`, `/changelog`, 404 |
| `src/styles.css` | Design tokens (light-first, dark via `data-theme="dark"`), buttons, tiles, motion |

## Adding a shader

Add an entry to `SHADERS` in `src/lib/shaders/library.ts`. The body must define `vec3 shade()` and can use `uC0–uC3`, `uSpeed`, `uScale`, `uGrain`, `uCell`, and the helpers `T()`, `uvA()`, `uvN()`, `fbm()`, `ramp()`, `grain()`, `bayer8()`. It appears in the library, gets its own page and prerenders automatically.

## Contributing

Issues and pull requests are welcome. New shaders should be one clear idea, run at 60fps on a laptop and ship with a dark and a light palette.

## Still to connect

- **Domain:** set `VITE_SITE_URL` and replace `hello@aurashades.example`.
- **npm package:** the docs describe `aurashades` / `aurashades/react`. The component exists in this repo (`AuraShade`); publishing it as a package is a separate step.

## Licence

MIT. See [LICENSE](LICENSE).

The AuraShades icon is the "sunburst" tile from [Glazed Icons](https://glazed-icons.vercel.app) (MIT), whose glyphs come from [Tabler Icons](https://tabler.io/icons) (MIT, © Paweł Kuna).
