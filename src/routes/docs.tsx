import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AuraShade } from '~/components/AuraShade'
import { SHADERS } from '~/lib/shaders/library'
import { cx } from '~/lib/cx'
import { breadcrumbLd, docsLd, seo } from '~/lib/seo'

export const Route = createFileRoute('/docs')({
  head: () =>
    seo({
      title: 'Docs: add a live shader background in React · AuraShades',
      description: 'Install AuraShades, render <AuraShade /> behind your content, and tune palette, speed, scale and grain with props. Covers performance and browser support.',
      path: '/docs',
      type: 'article',
      jsonLd: [docsLd(), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Docs', path: '/docs' }])],
    }),
  component: Docs,
})

const TOC = [
  { id: 'install', label: 'Install' },
  { id: 'first-background', label: 'Your first background' },
  { id: 'props', label: 'Component props' },
  { id: 'shaders', label: 'Shader IDs' },
  { id: 'text-on-shaders', label: 'Text on top of shaders' },
  { id: 'performance', label: 'Performance' },
  { id: 'support', label: 'Browser support' },
]

const PROPS = [
  { name: 'shader', type: 'string', def: 'required', desc: 'Shader ID from the table below.' },
  { name: 'palette', type: '[string, string, string, string]', def: 'follows theme', desc: 'Four hex colours, base first. Leave it out to use the dark or light palette for the current theme.' },
  { name: 'speed', type: 'number', def: '0.3–0.4', desc: 'Motion multiplier. 0 holds a still frame.' },
  { name: 'scale', type: 'number', def: '1', desc: 'Zoom of the pattern. Lower values give larger shapes.' },
  { name: 'grain', type: 'number', def: '0–0.2', desc: 'Film grain strength, for non-print styles.' },
  { name: 'cell', type: 'number', def: '4–9', desc: 'Dot or character size in CSS pixels, for Dither and ASCII.' },
  { name: 'dprCap', type: 'number', def: '1.5', desc: 'Highest pixel density to render at. Lower it for full-screen areas.' },
  { name: 'className', type: 'string', def: '—', desc: 'Size and position the canvas like any block element.' },
  { name: 'label', type: 'string', def: 'shader name', desc: 'Accessible name for the background image.' },
]

function Code({ children }: { children: string }) {
  return <pre className="code my-5" tabIndex={0}><code>{children}</code></pre>
}

function Docs() {
  const [active, setActive] = useState('install')
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (v) setActive(v.target.id)
    }, { rootMargin: '-90px 0px -65% 0px' })
    TOC.forEach((t) => { const el = document.getElementById(t.id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  return (
    <div className="wrap grid gap-12 pt-12 pb-24 md:pt-16 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav aria-label="On this page" className="sticky top-[100px] flex flex-col gap-1">
          <span className="mb-2 text-[14px] font-medium text-muted">On this page</span>
          {TOC.map((t) => (
            <a key={t.id} href={`#${t.id}`} className={cx('rounded-lg px-3 py-1.5 text-[15px] transition-colors duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]', active === t.id ? 'bg-panel text-ink' : 'text-muted hover:text-ink')}>
              {t.label}
            </a>
          ))}
        </nav>
      </aside>

      <article className="min-w-0 max-w-[72ch] text-[16.5px] leading-[1.7] text-ink-2 [&_h2]:scroll-mt-24 [&_h2]:font-display [&_h2]:text-[30px] [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-ink [&_h2]:mt-16 [&_h2]:mb-4 [&_p]:my-4 [&_code:not(pre_code)]:rounded-md [&_code:not(pre_code)]:bg-panel [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-[0.88em] [&_code:not(pre_code)]:text-ink">
        <h1 className="display text-[clamp(44px,5.5vw,76px)] text-ink">Docs</h1>
        <p className="lede mt-5">Add a live shader background to a React page in three steps, then tune it with props.</p>
        <p><strong className="font-medium text-ink">AuraShades</strong> is a library of live WebGL shader backgrounds for websites. Each background is a small fragment shader that the GPU draws every frame, so it stays sharp at any size and weighs far less than a video. You pick a shader, set four colours and a few dials, and render it with one React component.</p>

        <h2 id="install">Install</h2>
        <p>The package ships ES modules and TypeScript types. It needs React 18 or later and nothing else.</p>
        <Code>{`npm install aurashades`}</Code>
        <p>Pro and Team accounts get a licence key by email. Set it once, anywhere before the first background renders.</p>
        <Code>{`import { setLicence } from 'aurashades'

setLicence(import.meta.env.VITE_AURASHADES_KEY)`}</Code>

        <h2 id="first-background">Your first background</h2>
        <p>The component draws into a canvas that fills its parent. Give the parent a size and a position, then place your content above it.</p>
        <Code>{`import { AuraShade } from 'aurashades/react'

export function Hero() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <AuraShade shader="aurora-veil" className="absolute inset-0" />
      <div className="relative">…your headline…</div>
    </section>
  )
}`}</Code>
        <div className="my-6 h-40 overflow-hidden rounded-[16px] border border-line">
          <AuraShade shader="aurora-veil" label="Aurora Veil, the shader used in the example" />
        </div>
        <p>Every shader you open in the <Link to="/library" className="link text-ink">library</Link> can export this snippet with your palette and dials already filled in.</p>

        <h2 id="props">Component props</h2>
        <div className="my-5 overflow-x-auto rounded-[14px] border border-line">
          <table className="w-full min-w-[620px] border-collapse text-left text-[14.5px] leading-[1.5]">
            <thead><tr className="border-b border-line bg-panel">
              <th scope="col" className="p-3 font-medium text-ink">Prop</th>
              <th scope="col" className="p-3 font-medium text-ink">Type</th>
              <th scope="col" className="p-3 font-medium text-ink">Default</th>
              <th scope="col" className="p-3 font-medium text-ink">What it does</th>
            </tr></thead>
            <tbody>
              {PROPS.map((p) => (
                <tr key={p.name} className="border-b border-line last:border-0 align-top">
                  <td className="p-3"><code>{p.name}</code></td>
                  <td className="p-3 font-mono text-[13px] text-muted">{p.type}</td>
                  <td className="p-3 text-muted">{p.def}</td>
                  <td className="p-3">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="shaders">Shader IDs</h2>
        <div className="my-5 overflow-x-auto rounded-[14px] border border-line">
          <table className="w-full min-w-[520px] border-collapse text-left text-[14.5px] leading-[1.5]">
            <thead><tr className="border-b border-line bg-panel">
              <th scope="col" className="p-3 font-medium text-ink">ID</th>
              <th scope="col" className="p-3 font-medium text-ink">Style</th>
              <th scope="col" className="p-3 font-medium text-ink">Plan</th>
            </tr></thead>
            <tbody>
              {SHADERS.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="p-3"><Link to="/library/$shaderId" params={{ shaderId: s.id }} className="link font-mono text-[13.5px] text-ink">{s.id}</Link></td>
                  <td className="p-3">{s.style}</td>
                  <td className="p-3">{s.tier === 'pro' ? 'Pro' : 'Free'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="text-on-shaders">Text on top of shaders</h2>
        <p>Shaders move, so contrast changes from frame to frame. Put headlines and body text on a solid panel, or add a scrim from your page colour, and check contrast against the brightest frame. Every shader ships with a dark and a light palette and follows your site theme, so light text sits on the dark palette and dark text on the light one. Pass your own <code>palette</code> to pin one look in both themes.</p>

        <h2 id="performance">Performance</h2>
        <p>All backgrounds on a page share one WebGL context. Each frame, AuraShades renders the visible ones and copies their pixels into their own canvas, so ten backgrounds cost far less than ten contexts.</p>
        <p>Backgrounds outside the viewport are skipped. Pixel density is capped at 1.5× by default; pass <code>dprCap</code> to lower it for very large areas. When the visitor asks for reduced motion, each background draws one still frame.</p>

        <h2 id="support">Browser support</h2>
        <p>Any browser with WebGL 1, which covers current Chrome, Edge, Firefox and Safari on desktop and mobile. Without WebGL, the canvas keeps a static CSS gradient built from the palette, so the layout never shows an empty box.</p>
      </article>
    </div>
  )
}
