import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Pause, Play, SlidersHorizontal, ScanEye, Layers, Gauge, EyeOff, Cpu, Paintbrush } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { AuraShade, useMotionPaused } from '~/components/AuraShade'
import { Segmented } from '~/components/Segmented'
import { useTheme } from '~/lib/theme'
import { faqLd, seo, softwareLd } from '~/lib/seo'
import { ShaderEditor, useShaderParams } from '~/components/ShaderEditor'
import { Faq, PricingPlans } from '~/components/Pricing'
import { ATMOSPHERE, byId, freeCount, proCount, SHADERS, STYLES, styleList, word, Word, type ShaderParams } from '~/lib/shaders/library'
import { getEngine } from '~/lib/shaders/engine'
import { cx } from '~/lib/cx'
import { button } from '~/lib/button'

const GrainGradient = lazy(() => import('@paper-design/shaders-react').then((m) => ({ default: m.GrainGradient })))

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
  return (
    <>
      <Hero />
      <Collection />
      <EditorDemo />
      <Engine />
      <PricingSection />
      <FaqSection />
      <Close />
    </>
  )
}

function Hero() {
  const theme = useTheme()
  const paused = useMotionPaused()
  const preset = ATMOSPHERE.hero[theme]
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <div className="hero-bg absolute inset-0 -z-10">
        <AuraShade
          shader={preset.shader}
          params={preset.params as unknown as Partial<ShaderParams>}
          label="A live shader background behind the headline"
          dprCap={1.25}
        />
        <div className="hero-veil absolute inset-0" aria-hidden="true" />
      </div>

      <div data-enter className="wrap flex min-h-[min(calc(100svh-68px),920px)] flex-col items-center justify-center gap-7 py-24 text-center">
        <h1 id="hero-title" className="display mx-auto max-w-[17ch] text-[clamp(44px,6.6vw,96px)]">
          Live shader backgrounds for websites that should feel lit
        </h1>
        <p className="lede mx-auto !text-ink">
          {SHADERS.length} hand-tuned WebGL backgrounds in {word(STYLES.length)} styles. Tune the palette, then drop one React component behind your headline. {Word(freeCount)} are free for good.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/library" className={button({ variant: 'primary' })}>Browse free shaders</Link>
          <Link to="/pricing" className={button({ variant: 'secondary' })}>Get Pro</Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => getEngine().setPaused(!paused)}
        className={button({ variant: 'secondary', size: 'sm', icon: true, className: 'absolute bottom-6' })}
        style={{ right: 'max(24px, env(safe-area-inset-right, 0px))' }}
        aria-label={paused ? 'Play background motion' : 'Pause background motion'}
      >
        {paused ? <Play size={15} /> : <Pause size={15} />}
      </button>
    </section>
  )
}

const BENTO: { id: string; span: string }[] = [
  { id: 'ripple-tiles', span: 'md:col-span-7 md:row-span-2' },
  { id: 'liquid-chrome', span: 'md:col-span-5' },
  { id: 'fluted-glass', span: 'md:col-span-5' },
  { id: 'twisted-ribbon', span: 'md:col-span-4' },
  { id: 'topography', span: 'md:col-span-4' },
  { id: 'morph', span: 'md:col-span-4' },
]

function Collection() {
  return (
    <section className="wrap section" aria-labelledby="collection-title">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 id="collection-title" className="h2">{Word(proCount)} more backgrounds come with Pro</h2>
          <p className="lede">Rippling tile floors, fluted glass, liquid chrome, twisting ribbons, contour maps and more. Each one previews free in the editor.</p>
        </div>
        <Link to="/library" className={button({ variant: 'secondary', className: 'shrink-0' })}>See all {SHADERS.length} shaders <ArrowRight size={16} className="arrow" /></Link>
      </div>
      <div className="grid auto-rows-[240px] gap-4 md:grid-cols-12 md:auto-rows-[230px]">
        {BENTO.map(({ id, span }) => {
          const s = byId(id)!
          return (
            <Link key={id} to="/library/$shaderId" params={{ shaderId: id }} className={cx('tile', span)} aria-label={`${s.name}, ${s.style}. Open in the editor`}>
              <div className="absolute inset-0"><AuraShade shader={id} label={`${s.name} preview`} /></div>
              <div className="tile-bar">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{s.name}</span>
                  <span className="block truncate text-[13px] text-muted">{s.summary}</span>
                </span>
                <span className="chip chip-pro shrink-0">Pro</span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

const FREE_IDS = SHADERS.filter((s) => s.tier === 'free').map((s) => s.id)

function EditorDemo() {
  const [id, setId] = useState('silk')
  const [params, setParams] = useShaderParams(id)
  return (
    <section className="section border-y border-line bg-ground-2" aria-labelledby="editor-title">
      <div className="wrap flex flex-col gap-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <h2 id="editor-title" className="h2">Tune the palette in the browser, then copy one component</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Paintbrush, t: 'Four colours', d: 'Every shader runs on a four-stop palette you can set by hand or shuffle.' },
              { icon: SlidersHorizontal, t: 'Three dials', d: 'Speed, scale and grain, or dot and character size for print styles.' },
              { icon: ScanEye, t: 'Three exports', d: 'A React component, plain GLSL, or CSS tokens with a still fallback.' },
            ].map(({ icon: I, t, d }) => (
              <li key={t} className="flex flex-col gap-2">
                <I size={20} className="text-accent" aria-hidden="true" />
                <span className="font-medium">{t}</span>
                <span className="text-[14.5px] text-ink-2">{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel overflow-hidden !rounded-[24px]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="font-display text-[17px] font-semibold">Editor</span>
              <span className="hidden truncate text-[14px] text-muted sm:inline">{byId(id)!.description.split('. ')[0]}.</span>
            </div>
            <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
              <Segmented size="sm" label="Shader" value={id} onChange={setId} options={FREE_IDS.map((f) => ({ value: f, label: byId(f)!.name }))} />
            </div>
          </div>
          <ShaderEditor id={id} params={params} setParams={setParams} layout="frame" />
        </div>
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

function Engine() {
  const reduced = useReducedMotion()
  const paths = NODES.map((n) => {
    const y = (n.y / 100) * 360
    return `M150 180 C 260 180, 250 ${y}, 360 ${y}`
  })
  return (
    <section className="wrap section" aria-labelledby="engine-title">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative mx-auto aspect-[560/360] w-full max-w-[600px]" role="img" aria-label="Diagram: one WebGL context feeding four backgrounds on a page">
          <svg viewBox="0 0 560 360" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {paths.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
                {!reduced && (
                  <circle r="3.5" fill="var(--accent)">
                    <animateMotion dur="3.2s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                  </circle>
                )}
              </g>
            ))}
          </svg>
          <div className="absolute left-0 top-1/2 flex w-[27%] -translate-y-1/2 flex-col items-center gap-2 rounded-2xl border border-line bg-panel px-3 py-5 text-center shadow-[var(--shadow)]">
            <Cpu size={22} className="text-accent" aria-hidden="true" />
            <span className="text-[13px] font-medium leading-tight sm:text-[14px]">One WebGL context</span>
          </div>
          {NODES.map((n) => (
            <div key={n.label} className="absolute right-0 flex w-[34%] -translate-y-1/2 items-center gap-2.5 rounded-xl border border-line bg-panel p-1.5 pr-3" style={{ top: `${n.y}%` }}>
              <span className="h-8 w-11 shrink-0 overflow-hidden rounded-lg sm:h-9 sm:w-14"><AuraShade shader={n.id} dprCap={1} label={`${n.label} preview`} /></span>
              <span className="truncate text-[12.5px] font-medium sm:text-[14px]">{n.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 id="engine-title" className="h2">One canvas draws every background on the page</h2>
            <p className="lede">Browsers allow a handful of WebGL contexts per tab. AuraShades renders every background through a single one and copies the pixels to each spot, so a page full of shaders stays light.</p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {[
              { icon: EyeOff, t: 'Stops offscreen', d: 'Backgrounds outside the viewport skip their frames entirely.' },
              { icon: Pause, t: 'Rests on request', d: 'Reduced motion draws one still frame. A pause control stops the rest.' },
              { icon: Layers, t: 'Falls back cleanly', d: 'Without WebGL, each spot shows a CSS gradient from its palette.' },
              { icon: Gauge, t: 'Capped pixel density', d: 'Large heroes render at up to 1.25× so laptops keep their frame rate.' },
            ].map(({ icon: I, t, d }) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-panel"><I size={17} className="text-ink-2" aria-hidden="true" /></span>
                <span className="flex flex-col gap-1">
                  <span className="font-medium">{t}</span>
                  <span className="text-[14.5px] text-ink-2">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section className="section border-t border-line bg-ground-2" aria-labelledby="pricing-title">
      <div className="wrap flex flex-col gap-10">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 id="pricing-title" className="h2">Start free, upgrade when a client signs</h2>
          <p className="lede">The free plan keeps one shader in every style. Pro unlocks the full set and the React component.</p>
        </div>
        <PricingPlans />
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section className="wrap section" aria-labelledby="faq-title">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-4">
          <h2 id="faq-title" className="h2">Questions before you ship</h2>
          <p className="lede">Anything else goes to <span className="select-all text-ink">hello@aurashades.example</span>.</p>
        </div>
        <Faq />
      </div>
    </section>
  )
}

function Close() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const paused = useMotionPaused()
  const theme = useTheme()
  const c = ATMOSPHERE.close[theme]
  return (
    <section className="wrap pb-24" aria-labelledby="close-title">
      <div className="relative isolate overflow-hidden rounded-[28px] border border-line bg-ground-2">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {mounted && (
            <Suspense fallback={null}>
              <GrainGradient
                key={theme}
                style={{ width: '100%', height: '100%' }}
                colorBack={c.back}
                colors={[...c.colors]}
                softness={0.75}
                intensity={0.3}
                noise={0.3}
                shape="corners"
                speed={paused || getEngine().reduced ? 0 : 0.2}
              />
            </Suspense>
          )}
        </div>
        <div className="flex min-h-[440px] flex-col items-center justify-center gap-8 p-8 text-center md:min-h-[500px] md:p-14">
          <h2 id="close-title" className="display max-w-[16ch] text-[clamp(40px,6vw,84px)]">
            Give your next hero some light
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/library" className={button({ variant: 'primary' })}>Browse free shaders</Link>
            <Link to="/docs" className={button({ variant: 'secondary' })}>Read the docs</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
