import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Pause, Play, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AuraShade, useMotionPaused } from '~/components/AuraShade'
import { Segmented } from '~/components/Segmented'
import { LogoMark } from '~/components/Logo'
import { ShotCard } from '~/components/ShotCard'
import { faqLd, seo, softwareLd } from '~/lib/seo'
import { ShaderEditor, useShaderParams } from '~/components/ShaderEditor'
import { Faq, PricingPlans } from '~/components/Pricing'
import { BRAND_FIELDS, BRAND_SHADER, brandParams, byId, freeCount, proCount, SHADERS, STYLES, styleList, word, Word, type BrandField } from '~/lib/shaders/library'
import { getEngine } from '~/lib/shaders/engine'
import { cx } from '~/lib/cx'
import { button } from '~/lib/button'

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: 'AuraShades · Live shader backgrounds for the modern web',
      description: `${SHADERS.length} hand-tuned WebGL backgrounds in ${word(STYLES.length)} styles: ${styleList()}. Tune the palette and copy one React component. ${Word(freeCount)} are free.`,
      path: '/',
      jsonLd: [softwareLd(), faqLd()],
    }),
  component: Home,
})

function Home() {
  return (
    <>
      <Hero />
      <Styles />
      <Featured />
      <Playground />
      <HowItWorks />
      <Engine />
      <PricingSection />
      <FaqSection />
    </>
  )
}

/** Tiles that carry white labels keep their dark palette in both themes, so the label always reads. */
const darkOf = (id: string) => ({ palette: [...byId(id)!.palettes.dark] as [string, string, string, string] })

function SecHead({ n, label, title, children, id }: { n: string; label: string; title: React.ReactNode; children?: React.ReactNode; id: string }) {
  return (
    <div className="sec-head">
      <div className="stack-6">
        <span className="eyebrow"><b>[{n}]</b> {label}</span>
        <h2 id={id} className="h2">{title}</h2>
      </div>
      {children && <div className="stack-6 lg:pb-1">{children}</div>}
    </div>
  )
}

function PauseButton() {
  const paused = useMotionPaused()
  return (
    <button type="button" onClick={() => getEngine().setPaused(!paused)} className={button({ variant: 'glass', size: 'sm', icon: true })} aria-label={paused ? 'Play background motion' : 'Pause background motion'}>
      {paused ? <Play size={15} /> : <Pause size={15} />}
    </button>
  )
}

const STATS = [
  { v: SHADERS.length, l: 'Live shaders' },
  { v: STYLES.length, l: 'Styles' },
  { v: 3, l: 'Export formats' },
  { v: 1, l: 'WebGL context per page' },
]

/* First viewport: the signal field runs edge to edge; copy sits on its dark side. */
function Hero() {
  const [field, setField] = useState<BrandField>(BRAND_FIELDS[0])
  return (
    <section className="relative isolate overflow-hidden bg-[#030407] text-white" aria-labelledby="hero-title">
      <div className="field-develop absolute inset-0 -z-20">
        <AuraShade shader={BRAND_SHADER} params={brandParams(field)} crossfade dprCap={1.25} label="The AuraShades signal field: a band of electric colour breaking into pixels" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,#030407_0%,rgba(3,4,7,.86)_34%,rgba(3,4,7,.2)_68%,transparent_100%)] max-md:bg-[linear-gradient(180deg,rgba(3,4,7,.55)_0%,rgba(3,4,7,.9)_60%,#030407_100%)]" aria-hidden="true" />
      <div className="gridlines absolute inset-0 -z-10 opacity-60 [--line:rgba(255,255,255,.05)]" aria-hidden="true" />

      <div className="wrap flex min-h-[100svh] flex-col pt-[var(--page-top)] md:min-h-[min(100svh,980px)]">
        <div data-enter className="flex max-w-[980px] flex-1 flex-col justify-center gap-7 py-12 md:gap-8">
          <Link to="/library/$shaderId" params={{ shaderId: BRAND_SHADER }} className="group inline-flex h-9 items-center gap-2.5 self-start rounded-full border border-white/12 bg-white/[.06] pl-1.5 pr-3.5 text-[13px] text-white/80 backdrop-blur-md transition-colors hover:border-white/25">
            <span className="rounded-full bg-[var(--p-electric)] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-white">New</span>
            Signal Mosaic is free in the library
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <h1 id="hero-title" className="display-xl !text-white">
            Shaders for<br /><span className="signal-text">the modern web</span>
          </h1>
          <p className="max-w-[48ch] text-[17px] leading-[1.6] text-white/70 md:text-[19px]">
            {SHADERS.length} hand-tuned WebGL backgrounds in {word(STYLES.length)} styles. Tune four colours, then drop one React component behind your headline. {Word(freeCount)} are free for good.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/library" className={button({ variant: 'field' })}>Browse the library <ArrowRight size={16} className="arrow" /></Link>
            <a href="#playground" className={button({ variant: 'glass' })}>Open the playground</a>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-6 md:pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="eyebrow !text-white/50">Field</span>
              <div className="[&>div]:!border-white/12 [&>div]:!bg-white/[.06] [&>div]:backdrop-blur-md [&_button]:!text-white/60 [&_button[aria-checked=true]]:!text-[#030407] [&_span.bg-ink]:!bg-white">
                <Segmented size="sm" label="Field palette" value={field.id} onChange={(v) => setField(BRAND_FIELDS.find((f) => f.id === v)!)} options={BRAND_FIELDS.map((f) => ({ value: f.id, label: <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: `linear-gradient(135deg, ${f.palette[1]}, ${f.palette[2]} 60%, ${f.palette[3]})` }} />{f.name}</span> }))} />
              </div>
            </div>
            <PauseButton />
          </div>
          <dl className="grid grid-cols-2 overflow-hidden rounded-[var(--r-board)] border border-white/10 bg-[#030407]/55 backdrop-blur-md md:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.l} className={cx('flex flex-col-reverse gap-3 p-5 md:p-6', i % 2 === 1 && 'border-l border-white/10', i >= 2 && 'max-md:border-t max-md:border-white/10', i >= 1 && 'md:border-l md:border-white/10')}>
                <dt className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-white/50">{s.l}</dt>
                <dd className="stat text-[44px] text-white md:text-[56px]">{String(s.v).padStart(2, '0')}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/** One live tile per style: the style's free shader if it has one. */
const STYLE_TILES = STYLES.map((s) => {
  const list = SHADERS.filter((x) => x.style === s.id)
  return { style: s.id, id: (list.find((x) => x.tier === 'free') ?? list[0]).id, n: list.length }
})

function Styles() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); input.current?.focus() } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  return (
    <section className="wrap section" aria-labelledby="styles-title">
      <SecHead n="01" label="Styles" id="styles-title" title={<>{Word(STYLES.length)} styles,<br />one engine</>}>
        <p className="lede">Gradients, grain, dither, ASCII, chrome, eclipses and more. Pick a style, or search the whole set by name, colour or mood.</p>
        <form role="search" onSubmit={(e) => { e.preventDefault(); navigate({ to: '/library', search: q.trim() ? { q: q.trim() } : {} }) }} className="search max-w-[520px]">
          <Search size={17} aria-hidden="true" />
          <label htmlFor="home-search" className="sr-only">Search shaders</label>
          <input ref={input} id="home-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shaders: chrome, aurora, halftone…" autoComplete="off" />
          <span className="kbd" aria-hidden="true">/</span>
        </form>
      </SecHead>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
        {STYLE_TILES.map((t) => (
          <li key={t.style}>
            <Link to="/library" search={{ style: t.style }} className="tile block aspect-[3/4]" aria-label={`${t.style}: ${t.n} shaders`}>
              <span className="absolute inset-0"><AuraShade shader={t.id} params={darkOf(t.id)} dprCap={1} label={`${t.style} style preview`} /></span>
              <span className="field-scrim absolute inset-0" aria-hidden="true" />
              <span className="tile-label">
                <span className="text-[15px] font-[560] tracking-[-0.015em]">{t.style}</span>
                <span className="font-mono text-[11px] text-white/60">{String(t.n).padStart(2, '0')}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

const FEATURED = ['gilded-chrome', 'cobalt-halftone', 'jade-marble', 'prism-flow', 'lavender-arcs']

function Featured() {
  return (
    <section className="wrap section" aria-labelledby="featured-title">
      <SecHead n="02" label="Featured" id="featured-title" title={<>Picked from<br /><span className="signal-text">the Pro set</span></>}>
        <p className="lede">{Word(proCount)} more backgrounds come with Pro: liquid chrome, polished marble, halftone light and iridescent silk. Every one previews free in the editor.</p>
        <Link to="/library" className={button({ variant: 'secondary', className: 'self-start' })}>See all {SHADERS.length} shaders <ArrowRight size={16} className="arrow" /></Link>
      </SecHead>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED.map((id, i) => (
          <li key={id} className={cx(i === 0 && 'sm:col-span-2 lg:row-span-2')}>
            <ShotCard id={id} feature={i === 0} summary={i === 0} />
          </li>
        ))}
      </ul>
    </section>
  )
}

const FREE_IDS = ['signal-mosaic', ...SHADERS.filter((s) => s.tier === 'free' && s.id !== 'signal-mosaic').map((s) => s.id)]

function Playground() {
  const [id, setId] = useState('silk')
  const [params, setParams] = useShaderParams(id)
  return (
    <section id="playground" className="wrap section scroll-mt-24" aria-labelledby="editor-title">
      <SecHead n="03" label="Playground" id="editor-title" title={<>Tune it live.<br /><span className="signal-text">Copy the code.</span></>}>
        <p className="lede">Four colours and three dials on every shader. Export a typed React component, plain GLSL, or CSS tokens with a still fallback.</p>
      </SecHead>
      <div className="board board-flush">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-line-strong" /><i className="h-2.5 w-2.5 rounded-full bg-line-strong" /><i className="h-2.5 w-2.5 rounded-full bg-line-strong" /></span>
            <span className="spec uppercase text-muted">editor / {byId(id)!.name.toLowerCase().replace(/\s+/g, '-')}</span>
          </div>
          <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
            <Segmented size="sm" label="Shader" value={id} onChange={setId} options={FREE_IDS.slice(0, 7).map((f) => ({ value: f, label: byId(f)!.name }))} />
          </div>
        </div>
        <ShaderEditor id={id} params={params} setParams={setParams} layout="frame" />
      </div>
    </section>
  )
}

const STEPS = [
  { t: 'Pick a shader', d: `Start from ${SHADERS.length} backgrounds sorted into ${word(STYLES.length)} styles. Every one runs live, right in the card.` },
  { t: 'Tune four colours', d: 'Drop in your brand palette, then set speed, scale and grain. Blends run in OKLab, so mid-tones stay vivid.' },
  { t: 'Ship one component', d: 'Copy a typed React component with your settings baked in, or take plain GLSL and CSS tokens.' },
]

function HowItWorks() {
  return (
    <section className="wrap section" aria-labelledby="how-title">
      <SecHead n="04" label="How it works" id="how-title" title={<>From palette<br />to production</>} />
      <ol className="hair grid-cols-1 overflow-hidden rounded-[var(--r-board)] md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.t} className="flex flex-col gap-12 bg-panel p-6 md:gap-16 md:p-8">
            <span className="stat signal-text self-start text-[72px] md:text-[96px]">{String(i + 1).padStart(2, '0')}</span>
            <div className="stack-4">
              <h3 className="h3">{s.t}</h3>
              <p className="body">{s.d}</p>
              {i === 2 && (
                <pre className="code !py-3 text-[12px]"><code><span className="text-[var(--p-pink)]">{'<AuraShade'}</span>{' shader='}<span className="text-[var(--p-cyan)]">"signal-mosaic"</span>{' />'}</code></pre>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function useReducedMotion() {
  const [r, setR] = useState(false)
  useEffect(() => setR(matchMedia('(prefers-reduced-motion: reduce)').matches), [])
  return r
}

const NODES = [
  { label: 'Hero', id: 'aurora-veil', y: 14 },
  { label: 'Feature card', id: 'pastel-haze', y: 38 },
  { label: 'Pricing card', id: 'grain-bloom', y: 62 },
  { label: 'Footer band', id: 'bayer-wave', y: 86 },
]

const POINTS = [
  { t: 'Stops offscreen', d: 'Backgrounds outside the viewport skip their frames entirely.' },
  { t: 'Rests on request', d: 'Reduced motion draws one still frame. A pause control stops the rest.' },
  { t: 'Falls back cleanly', d: 'Without WebGL, each spot shows a CSS gradient from its palette.' },
  { t: 'Capped pixel density', d: 'Large heroes render at up to 1.25× so laptops keep their frame rate.' },
]

function Engine() {
  const reduced = useReducedMotion()
  const paths = NODES.map((n) => `M150 180 C 260 180, 250 ${(n.y / 100) * 360}, 360 ${(n.y / 100) * 360}`)
  return (
    <section className="wrap section" aria-labelledby="engine-title">
      <SecHead n="05" label="For developers" id="engine-title" title={<>One canvas.<br /><span className="signal-text">Every background.</span></>}>
        <p className="lede">Browsers allow a handful of WebGL contexts per tab. AuraShades renders every background through a single one and copies the pixels to each spot, so a page full of shaders stays light.</p>
      </SecHead>
      <div className="boards lg:grid-cols-12">
        <div className="board relative flex items-center justify-center overflow-hidden lg:col-span-7">
          <div className="gridlines absolute inset-0" aria-hidden="true" />
          <div className="relative aspect-[560/360] w-full max-w-[600px]" role="img" aria-label="Diagram: one WebGL context feeding four backgrounds on a page">
            <svg viewBox="0 0 560 360" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="wire" x1="0" x2="1"><stop offset="0" stopColor="var(--accent)" /><stop offset="1" stopColor="var(--accent-2)" /></linearGradient>
              </defs>
              {paths.map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
                  {!reduced && (
                    <circle r="3.5" fill="url(#wire)">
                      <animateMotion dur="3.2s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                    </circle>
                  )}
                </g>
              ))}
            </svg>
            <div className="card absolute left-0 top-1/2 flex w-[27%] -translate-y-1/2 flex-col items-center gap-2 px-3 py-5 text-center">
              <LogoMark size={24} className="text-accent-2" />
              <span className="text-[13px] font-[560] leading-tight sm:text-[14px]">One WebGL context</span>
            </div>
            {NODES.map((n) => (
              <div key={n.label} className="card absolute right-0 flex w-[34%] -translate-y-1/2 items-center gap-2.5 !rounded-[12px] px-3 py-2 sm:p-1.5 sm:pr-3" style={{ top: `${n.y}%` }}>
                <span className="hidden h-9 w-14 shrink-0 overflow-hidden rounded-[6px] sm:block"><AuraShade shader={n.id} params={darkOf(n.id)} dprCap={1} label={`${n.label} preview`} /></span>
                <span className="truncate text-[12.5px] font-[560] sm:text-[14px]">{n.label}</span>
              </div>
            ))}
          </div>
        </div>

        <dl className="hair grid-cols-1 overflow-hidden rounded-[var(--r-board)] sm:grid-cols-2 lg:col-span-5">
          {POINTS.map((p, i) => (
            <div key={p.t} className="flex flex-col justify-between gap-8 bg-panel p-6">
              <span className="spec text-accent-2">0{i + 1}</span>
              <div className="flex flex-col gap-1.5">
                <dt className="text-[16px] font-[600] tracking-[-0.015em] text-ink">{p.t}</dt>
                <dd className="text-[14.5px] leading-[1.55] text-ink-2">{p.d}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section className="wrap section" aria-labelledby="pricing-title">
      <SecHead n="06" label="Pricing" id="pricing-title" title={<>Start free.<br />Upgrade when<br />a client signs.</>}>
        <p className="lede">The free plan keeps at least one shader in every style. Pro unlocks the full set and the React component.</p>
      </SecHead>
      <PricingPlans />
    </section>
  )
}

function FaqSection() {
  return (
    <section className="wrap section" aria-labelledby="faq-title">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="stack-6 self-start lg:sticky lg:top-28">
          <span className="eyebrow"><b>[07]</b> FAQ</span>
          <h2 id="faq-title" className="h2">Questions before you ship</h2>
          <p className="body">Anything else goes to <span className="select-all text-ink">hello@aurashades.example</span>.</p>
        </div>
        <Faq />
      </div>
    </section>
  )
}

