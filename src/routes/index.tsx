import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
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
      title: 'AuraShades · Live shader backgrounds for websites',
      description: `${SHADERS.length} hand-tuned WebGL backgrounds in ${word(STYLES.length)} styles: ${styleList()}. Tune the palette and copy one React component. ${Word(freeCount)} are free.`,
      path: '/',
      jsonLd: [softwareLd(), faqLd()],
    }),
  component: Home,
})

function Home() {
  const [field, setField] = useState<BrandField>(BRAND_FIELDS[0])
  return (
    <>
      <Hero field={field} setField={setField} />
      <Collection />
      <EditorDemo />
      <Engine />
      <PricingSection />
      <FaqSection />
      <Close field={field} />
    </>
  )
}

/** Tiles that carry white labels keep their dark palette in both themes, so the label always reads. */
const darkOf = (id: string) => ({ palette: [...byId(id)!.palettes.dark] as [string, string, string, string] })

function PauseButton({ className }: { className?: string }) {
  const paused = useMotionPaused()
  return (
    <button
      type="button"
      onClick={() => getEngine().setPaused(!paused)}
      className={button({ variant: 'glass', size: 'sm', icon: true, className })}
      aria-label={paused ? 'Play background motion' : 'Pause background motion'}
    >
      {paused ? <Play size={15} /> : <Pause size={15} />}
    </button>
  )
}

/* First viewport: the hero board carries the live field; the specimen board re-tints it. */
function Hero({ field, setField }: { field: BrandField; setField: (f: BrandField) => void }) {
  return (
    <section className="wrap pt-2 md:pt-4" aria-labelledby="hero-title">
      <div className="boards lg:h-[clamp(620px,calc(100svh-88px),800px)] lg:grid-cols-12 lg:grid-rows-2">
        <div data-enter-board className="field min-h-[min(640px,calc(100svh-88px))] lg:col-span-8 lg:row-span-2 lg:min-h-0">
          <div className="field-develop absolute inset-0 -z-10">
            <AuraShade shader={BRAND_SHADER} params={brandParams(field)} crossfade dprCap={1.25} label="The AuraShades field: a live grainy gradient behind the headline" />
          </div>
          <div className="field-scrim-copy absolute inset-0 -z-10" aria-hidden="true" />
          <PauseButton className="absolute right-4 top-4 md:right-6 md:top-6" />
          <div data-enter className="flex h-full flex-col justify-end gap-6 p-6 md:p-10">
            <LogoMark size={36} className="text-white" />
            <h1 id="hero-title" className="display-xl field-ink max-w-[13ch] !text-white">
              Live shader backgrounds for websites
            </h1>
            <p className="max-w-[46ch] text-[17px] leading-[1.55] text-white/90 md:text-[19px]">
              {SHADERS.length} hand-tuned WebGL backgrounds in {word(STYLES.length)} styles. Tune four colours, then drop one React component behind your headline. {Word(freeCount)} are free for good.
            </p>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Link to="/library" className={button({ variant: 'field' })}>Browse free shaders <ArrowRight size={16} className="arrow" /></Link>
              <Link to="/pricing" className={button({ variant: 'glass' })}>Get Pro</Link>
            </div>
          </div>
        </div>

        <Specimen field={field} setField={setField} />

        <Link data-enter-board to="/library" className="tile min-h-[280px] lg:col-span-4 lg:min-h-0" aria-label={`Open the library: ${SHADERS.length} shaders in ${word(STYLES.length)} styles`}>
          <span className="absolute inset-0"><AuraShade shader="solar-eclipse" params={darkOf("solar-eclipse")} dprCap={1.25} label="Solar Eclipse, one of the library shaders" /></span>
          <span className="field-scrim absolute inset-0" aria-hidden="true" />
          <span className="tile-label">
            <span className="flex flex-col gap-1">
              <span className="font-display text-[22px] font-[650] leading-tight tracking-[-0.02em]">{SHADERS.length} shaders, {word(STYLES.length)} styles</span>
              <span className="text-[14px] text-white/75">Every one runs live and opens in the editor.</span>
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#0c1322]"><ArrowUpRight size={18} /></span>
          </span>
        </Link>
      </div>
    </section>
  )
}

function Specimen({ field, setField }: { field: BrandField; setField: (f: BrandField) => void }) {
  return (
    <div data-enter-board className="board flex flex-col justify-between gap-6 lg:col-span-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="h3">Four colours run every shader</h2>
          <p className="small">Pick a set and the hero field re-tints to match.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {field.palette.map((c, i) => (
          <div key={i} className="flex min-w-0 flex-col gap-2">
            <span className="block aspect-square rounded-[10px] border border-black/5 transition-colors duration-200" style={{ background: c }} />
            <span className="spec truncate uppercase text-muted">{c}</span>
          </div>
        ))}
      </div>
      <Segmented
        label="Field palette"
        value={field.id}
        onChange={(v) => setField(BRAND_FIELDS.find((f) => f.id === v)!)}
        options={BRAND_FIELDS.map((f) => ({ value: f.id, label: f.name }))}
        className="self-start"
      />
    </div>
  )
}

const GALLERY = ['gilded-chrome', 'jade-marble', 'cobalt-halftone', 'prism-flow', 'terracotta-drift', 'lavender-arcs']

function Collection() {
  return (
    <section className="wrap section" aria-labelledby="collection-title">
      <div className="sec-head">
        <div className="stack-4 max-w-2xl">
          <h2 id="collection-title" className="h2">{Word(proCount)} more backgrounds come with Pro</h2>
          <p className="lede">Liquid chrome, polished marble, halftone light, iridescent silk and embossed plaster. Every one previews free in the editor.</p>
        </div>
        <Link to="/library" className={button({ variant: 'secondary', className: 'shrink-0 self-start md:self-auto' })}>See all {SHADERS.length} shaders <ArrowRight size={16} className="arrow" /></Link>
      </div>
      <ul className="boards sm:grid-cols-2 lg:grid-cols-3">
        {GALLERY.map((id) => (
          <li key={id}>
            <ShotCard id={id} />
          </li>
        ))}
      </ul>
    </section>
  )
}

const FREE_IDS = SHADERS.filter((s) => s.tier === 'free').map((s) => s.id)

function EditorDemo() {
  const [id, setId] = useState('silk')
  const [params, setParams] = useShaderParams(id)
  return (
    <section className="wrap section" aria-labelledby="editor-title">
      <div className="sec-head">
        <div className="stack-4 max-w-2xl">
          <h2 id="editor-title" className="h2">Tune the palette in the browser, then copy one component</h2>
          <p className="lede">Four colours and three dials on every shader. Export a React component, plain GLSL, or CSS tokens with a still fallback.</p>
        </div>
      </div>
      <div className="board board-flush">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-display text-[16px] font-[650]">Editor</span>
            <span className="hidden truncate text-[14px] text-muted sm:inline">{byId(id)!.summary}</span>
          </div>
          <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
            <Segmented size="sm" label="Shader" value={id} onChange={setId} options={FREE_IDS.slice(0, 8).map((f) => ({ value: f, label: byId(f)!.name }))} />
          </div>
        </div>
        <ShaderEditor id={id} params={params} setParams={setParams} layout="frame" />
      </div>
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
      <div className="boards lg:grid-cols-12">
        <div className="board flex items-center justify-center lg:col-span-7">
          <div className="relative aspect-[560/360] w-full max-w-[600px]" role="img" aria-label="Diagram: one WebGL context feeding four backgrounds on a page">
            <svg viewBox="0 0 560 360" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {paths.map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
                  {!reduced && (
                    <circle r="3.5" fill="var(--hot)">
                      <animateMotion dur="3.2s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                    </circle>
                  )}
                </g>
              ))}
            </svg>
            <div className="card absolute left-0 top-1/2 flex w-[27%] -translate-y-1/2 flex-col items-center gap-2 px-3 py-5 text-center">
              <LogoMark size={24} className="text-hot" />
              <span className="text-[13px] font-[560] leading-tight sm:text-[14px]">One WebGL context</span>
            </div>
            {NODES.map((n) => (
              <div key={n.label} className="card absolute right-0 flex w-[34%] -translate-y-1/2 items-center gap-2.5 !rounded-[12px] px-3 py-2 sm:p-1.5 sm:pr-3" style={{ top: `${n.y}%` }}>
                <span className="hidden h-9 w-14 shrink-0 overflow-hidden rounded-[6px] sm:block"><AuraShade shader={n.id} dprCap={1} label={`${n.label} preview`} /></span>
                <span className="truncate text-[12.5px] font-[560] sm:text-[14px]">{n.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="board flex flex-col gap-8 lg:col-span-5">
          <div className="stack-4">
            <h2 id="engine-title" className="h2">One canvas draws every background on the page</h2>
            <p className="body">Browsers allow a handful of WebGL contexts per tab. AuraShades renders every background through a single one and copies the pixels to each spot, so a page full of shaders stays light.</p>
          </div>
          <dl className="grid border-t border-line sm:grid-cols-2">
            {POINTS.map((p, i) => (
              <div key={p.t} className={cx('flex flex-col gap-1 border-b border-line py-4', i % 2 === 0 ? 'sm:pr-6' : 'sm:border-l sm:pl-6')}>
                <dt className="font-[600] text-ink">{p.t}</dt>
                <dd className="text-[14.5px] leading-[1.5] text-ink-2">{p.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section className="wrap section" aria-labelledby="pricing-title">
      <div className="sec-head">
        <div className="stack-4 max-w-2xl">
          <h2 id="pricing-title" className="h2">Start free, upgrade when a client signs</h2>
          <p className="lede">The free plan keeps at least one shader in every style. Pro unlocks the full set and the React component.</p>
        </div>
      </div>
      <PricingPlans />
    </section>
  )
}

function FaqSection() {
  return (
    <section className="wrap section" aria-labelledby="faq-title">
      <div className="board grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="stack-4">
          <h2 id="faq-title" className="h2">Questions before you ship</h2>
          <p className="body">Anything else goes to <span className="select-all text-ink">hello@aurashades.example</span>.</p>
        </div>
        <Faq />
      </div>
    </section>
  )
}

/* The close: the field with a clear aura at its centre, the mark inside it. */
function Close({ field }: { field: BrandField }) {
  return (
    <section className="wrap section pb-4 md:pb-6" aria-labelledby="close-title">
      <div className="field min-h-[600px] md:min-h-[640px]">
        <div className="absolute inset-0 -z-10">
          <AuraShade shader={BRAND_SHADER} params={brandParams(field)} crossfade label="The AuraShades field around the closing message" />
        </div>
        <div className="aura absolute inset-0 -z-10" aria-hidden="true" />
        <div className="relative flex min-h-[600px] flex-col items-center justify-center gap-6 px-6 py-16 text-center text-ink md:min-h-[640px]">
          <LogoMark size={40} className="text-hot" />
          <h2 id="close-title" className="h2 max-w-[13ch]">Give your next hero some light</h2>
          <div className="grid w-full max-w-[280px] gap-3 sm:flex sm:max-w-none sm:justify-center">
            <Link to="/library" className={button({ variant: 'primary' })}>Browse free shaders</Link>
            <Link to="/docs" className={button({ variant: 'secondary' })}>Read the docs</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
