import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Pause, Play, Search } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AuraShade, useMotionPaused } from '~/components/AuraShade'
import { Segmented } from '~/components/Segmented'
import { ShotCard } from '~/components/ShotCard'
import { faqLd, seo, softwareLd } from '~/lib/seo'
import { ShaderEditor, useShaderParams } from '~/components/ShaderEditor'
import { Faq, PricingPlans } from '~/components/Pricing'
import { BRAND_FIELDS, BRAND_SHADER, brandParams, byId, freeCount, proCount, SHADERS, STYLES, styleList, word, Word, type BrandField } from '~/lib/shaders/library'
import { CHANGELOG } from '~/lib/changelog'
import { getEngine } from '~/lib/shaders/engine'
import { cx } from '~/lib/cx'
import { button } from '~/lib/button'

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: 'AuraShades · Live shader backgrounds for websites',
      description: `${SHADERS.length} hand-tuned WebGL shader backgrounds in ${word(STYLES.length)} styles: ${styleList()}. Tune four colours in the browser and copy one React component, GLSL or CSS. ${Word(freeCount)} are free.`,
      path: '/',
      jsonLd: [softwareLd(), faqLd()],
    }),
  component: Home,
})

function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <Styles />
      <Featured />
      <Playground />
      <Steps />
      <Engine />
      <PricingSection />
      <FaqSection />
    </>
  )
}

/** Tiles that carry white labels keep their dark palette in both themes, so the label always reads. */
const darkOf = (id: string) => ({ palette: [...byId(id)!.palettes.dark] as [string, string, string, string] })

/** Section head: a hairline with a mono label and index, then the title and its lede. */
function SecHead({ n, label, title, children, id }: { n: string; label: string; title: ReactNode; children?: ReactNode; id: string }) {
  return (
    <div data-reveal>
      <div className="sec-label">
        <span className="eyebrow">{label}</span>
        <span className="eyebrow">{n}</span>
      </div>
      <div className="sec-head">
        <h2 id={id} className="h2">{title}</h2>
        {children && <div className="stack-6 lg:pb-1.5">{children}</div>}
      </div>
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

/* First viewport: a centred headline, then the Dune gradient on a stage with a live editor card floating on it. */
function Hero() {
  const [field, setField] = useState<BrandField>(BRAND_FIELDS[0])
  const latest = CHANGELOG[0]
  const pal = field.palette
  return (
    <section className="wrap page-top" aria-labelledby="hero-title">
      <div data-enter className="mx-auto flex max-w-[900px] flex-col items-center gap-7 text-center md:gap-8">
        <Link to="/changelog" className="group inline-flex h-9 items-center gap-2.5 rounded-full bg-panel py-1 pl-1 pr-3.5 text-[13.5px] text-ink-2 shadow-[var(--ring-strong)] no-underline transition-shadow duration-200 hover:shadow-[0_0_0_1px_var(--ink)]">
          <span className="rounded-full bg-ink px-2.5 py-[5px] text-[11.5px] font-[560] leading-none text-ground">New</span>
          {latest.title}
          <ArrowRight size={14} className="text-muted transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
        <h1 id="hero-title" className="display-xl">
          Live backgrounds,<br /><em>made to ship.</em>
        </h1>
        <p className="lede mx-auto text-center">
          {SHADERS.length} hand-tuned WebGL shaders in {word(STYLES.length)} styles. Tune four colours, then drop one React component behind your headline.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/library" className={button({ variant: 'primary' })}>Browse the library <ArrowRight size={16} className="arrow" /></Link>
          <Link to="/docs" className={button({ variant: 'secondary' })}>Read the docs</Link>
        </div>
        <p className="small">{Word(freeCount)} free shaders · React, GLSL or CSS · No account</p>
      </div>

      {/* The stage: Dune, live, with the editor card it would come out of */}
      <div className="field field-develop relative mt-14 aspect-[4/5] sm:aspect-[16/10] md:mt-20 lg:aspect-[16/9]">
        <div className="absolute inset-0 -z-10">
          <AuraShade shader={BRAND_SHADER} params={brandParams(field)} crossfade dprCap={1} label="The Dune gradient, live: sunset strata under fine grain" />
        </div>
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between md:left-6 md:right-6 md:top-6">
          <span className="chip chip-on-media gap-2 !px-3"><i className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />Live WebGL</span>
          <PauseButton />
        </div>
        <div className="absolute inset-x-4 bottom-4 md:inset-x-auto md:bottom-8 md:left-1/2 md:w-[min(600px,calc(100%-64px))] md:-translate-x-1/2">
          <div className="rounded-[var(--r-card)] bg-white/90 p-2 text-[#0b0b0d] shadow-[0_0_0_1px_rgba(11,11,13,.06),0_30px_60px_-28px_rgba(11,11,13,.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-1.5">
              <span className="flex items-center gap-2.5">
                <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-black/10" /><i className="h-2.5 w-2.5 rounded-full bg-black/10" /><i className="h-2.5 w-2.5 rounded-full bg-black/10" /></span>
                <span className="font-mono text-[12px] text-black/50">hero.tsx</span>
              </span>
              <div role="radiogroup" aria-label="Dune palette" className="flex gap-1">
                {BRAND_FIELDS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={f.id === field.id}
                    aria-label={f.name}
                    onClick={() => setField(f)}
                    className={cx('flex h-8 items-center gap-2 rounded-full px-2.5 text-[13px] font-[520] transition-colors duration-150 sm:px-3', f.id === field.id ? 'bg-[#0b0b0d] text-white' : 'text-black/55 hover:bg-black/5 hover:text-black')}
                  >
                    <i className="h-3 w-3 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]" style={{ background: `linear-gradient(160deg, ${f.palette[0]}, ${f.palette[2]} 60%, ${f.palette[3]})` }} aria-hidden="true" />
                    <span className="hidden sm:inline">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <pre className="overflow-x-auto rounded-[12px] bg-[#0b0b0d] px-5 py-4 font-mono text-[12.5px] leading-[1.7] text-[#c9c9d1] [scrollbar-width:none]"><code><span className="text-[#f29a78]">{'<AuraShade'}</span>{'\n  shader='}<span className="text-[#a7d8b8]">"dune"</span>{'\n  palette={['}{pal.map((c, i) => <span key={i}><span className="text-[#a7d8b8]">'{c}'</span>{i < 3 ? ', ' : ''}</span>)}{']}\n'}<span className="text-[#f29a78]">{'/>'}</span></code></pre>
          </div>
        </div>
      </div>
    </section>
  )
}

/* One sentence that says what the product is, with three live shaders set inline like words */
function Inline({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Link to="/library/$shaderId" params={{ shaderId: id }} className="group inline-flex translate-y-[-0.06em] items-center gap-[0.3em] whitespace-nowrap align-middle text-ink no-underline">
      <span className="inline-block h-[0.82em] w-[1.4em] overflow-hidden rounded-[0.24em] shadow-[var(--ring)] transition-transform duration-300 group-hover:scale-105">
        <AuraShade shader={id} params={darkOf(id)} dprCap={1} label={`${byId(id)!.name} preview`} />
      </span>
      {children}
    </Link>
  )
}

function Statement() {
  return (
    <section className="wrap section" aria-label="What AuraShades is">
      <p data-reveal className="mx-auto max-w-[980px] text-center text-[clamp(26px,3.3vw,44px)] font-[500] leading-[1.26] tracking-[-0.035em] text-muted [text-wrap:balance]">
        Pick a <Inline id="grain-bloom">grain</Inline>, <Inline id="aurora-veil">aurora</Inline> or <Inline id="liquid-chrome">chrome</Inline> background.{' '}
        <span className="text-ink">Tune four colours and ship one component.</span> Every one runs live on the GPU, weighs a few kilobytes and stays sharp at any size.
      </p>
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
    const k = (e: KeyboardEvent) => { if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) { e.preventDefault(); input.current?.focus() } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  return (
    <section className="wrap section" aria-labelledby="styles-title">
      <SecHead n="01" label="Styles" id="styles-title" title={<>{Word(STYLES.length)} styles, <em>one engine.</em></>}>
        <p className="lede">Gradients, grain, dither, ASCII, chrome and eclipses. Pick a style, or search the whole set by name, colour or mood.</p>
        <form role="search" onSubmit={(e) => { e.preventDefault(); navigate({ to: '/library', search: q.trim() ? { q: q.trim() } : {} }) }} className="search max-w-[480px]">
          <Search size={17} aria-hidden="true" />
          <label htmlFor="home-search" className="sr-only">Search shaders</label>
          <input ref={input} id="home-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: chrome, aurora, halftone" autoComplete="off" />
          <span className="kbd" aria-hidden="true">/</span>
        </form>
      </SecHead>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-7">
        {STYLE_TILES.map((t, i) => (
          <li key={t.style} data-reveal style={{ '--d': `${(i % 7) * 40}ms` } as CSSProperties}>
            <Link to="/library" search={{ style: t.style }} className="tile block aspect-[3/4]" aria-label={`${t.style}: ${t.n} shaders`}>
              <span className="absolute inset-0"><AuraShade shader={t.id} params={darkOf(t.id)} dprCap={1} label={`${t.style} style preview`} /></span>
              <span className="field-scrim absolute inset-0" aria-hidden="true" />
              <span className="tile-label">
                <span className="text-[15px] font-[540] tracking-[-0.015em]">{t.style}</span>
                <span className="font-mono text-[11px] text-white/70">{String(t.n).padStart(2, '0')}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

const FEATURED = ['gilded-chrome', 'jade-marble', 'cobalt-halftone', 'signal-flow', 'prism-flow', 'solar-eclipse']

function Featured() {
  return (
    <section className="wrap section" aria-labelledby="featured-title">
      <SecHead n="02" label="Featured" id="featured-title" title={<>Picked from <em>the library.</em></>}>
        <p className="lede">{Word(proCount)} more backgrounds come with Pro: liquid chrome, polished marble, halftone light and iridescent silk. Every one previews free in the editor.</p>
        <Link to="/library" className={button({ variant: 'secondary', className: 'self-start' })}>See all {SHADERS.length} shaders <ArrowRight size={16} className="arrow" /></Link>
      </SecHead>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {FEATURED.map((id, i) => (
          <li key={id} data-reveal style={{ '--d': `${(i % 3) * 60}ms` } as CSSProperties}>
            <ShotCard id={id} summary />
          </li>
        ))}
      </ul>
    </section>
  )
}

const PLAY_IDS = ['dune', 'silk', 'signal-flow', 'grain-bloom', 'aurora-veil', 'bayer-wave', 'ascii-flow']

function Playground() {
  const [id, setId] = useState('dune')
  const [params, setParams] = useShaderParams(id)
  return (
    <section id="playground" className="wrap section scroll-mt-24" aria-labelledby="editor-title">
      <SecHead n="03" label="Playground" id="editor-title" title={<>Tune it live. <em>Copy the code.</em></>}>
        <p className="lede">Four colours and three dials on every shader. Export a typed React component, plain GLSL, or CSS tokens with a still fallback.</p>
      </SecHead>
      <div className="board board-flush" data-reveal>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
          <span className="spec text-muted">editor / {byId(id)!.name.toLowerCase().replace(/\s+/g, '-')}</span>
          <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
            <Segmented size="sm" label="Shader" value={id} onChange={setId} options={PLAY_IDS.map((f) => ({ value: f, label: byId(f)!.name }))} />
          </div>
        </div>
        <ShaderEditor id={id} params={params} setParams={setParams} layout="frame" />
      </div>
    </section>
  )
}

const STEPS = [
  { t: 'Pick a shader', d: `Start from ${SHADERS.length} backgrounds in ${word(STYLES.length)} styles. Every one runs live, right in the card.` },
  { t: 'Tune four colours', d: 'Drop in your brand palette, then set speed, scale and grain. Blends run in OKLab, so mid-tones stay vivid.' },
  { t: 'Ship one component', d: 'Copy a typed React component with your settings baked in, or take plain GLSL and CSS tokens.' },
]

function Steps() {
  return (
    <section className="wrap section" aria-labelledby="how-title">
      <SecHead n="04" label="How it works" id="how-title" title={<>From palette to page <em>in minutes.</em></>} />
      <ol className="grid gap-4 md:grid-cols-3 md:gap-5" data-reveal>
        {STEPS.map((s, i) => (
          <li key={s.t} className="card flex flex-col gap-10 p-7 md:p-8">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-panel-2 font-mono text-[13px] text-ink shadow-[var(--ring)]">{i + 1}</span>
            <div className="stack-4 !gap-2.5">
              <h3 className="h3">{s.t}</h3>
              <p className="body">{s.d}</p>
            </div>
            {i === 2 && <pre className="code mt-auto !px-5 !py-3.5 text-[12px]"><code><span className="text-[#f29a78]">{'<AuraShade'}</span>{' shader='}<span className="text-[#a7d8b8]">"dune"</span>{' />'}</code></pre>}
          </li>
        ))}
      </ol>
    </section>
  )
}

const POINTS = [
  { t: 'One WebGL context', d: 'Every background on the page renders through a single context and is copied into place, so ten cost about as much as one.' },
  { t: 'Stops offscreen', d: 'Backgrounds outside the viewport skip their frames entirely, and thumbnails step down while you scroll.' },
  { t: 'Rests on request', d: 'Reduced motion draws one still frame. A pause control stops the rest.' },
  { t: 'Falls back cleanly', d: 'Without WebGL, each spot shows a CSS gradient built from its own palette.' },
]

function Engine() {
  return (
    <section className="wrap section" aria-labelledby="engine-title">
      <SecHead n="05" label="For developers" id="engine-title" title={<>Light on the page, <em>by design.</em></>}>
        <p className="lede">A shader is a few kilobytes of code, not a video. AuraShades adds the care around it that a production page needs.</p>
      </SecHead>
      <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
        {POINTS.map((p, i) => (
          <div key={p.t} className="flex flex-col gap-2.5 border-t border-ink pt-5">
            <span className="spec text-muted">0{i + 1}</span>
            <dt className="text-[16px] font-[560] tracking-[-0.015em] text-ink">{p.t}</dt>
            <dd className="text-[15px] leading-[1.6] text-ink-2">{p.d}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function PricingSection() {
  return (
    <section className="wrap section" aria-labelledby="pricing-title">
      <SecHead n="06" label="Pricing" id="pricing-title" title={<>Start free. Upgrade when <em>a client signs.</em></>}>
        <p className="lede">The free plan keeps at least one shader in every style. Pro unlocks the full set and the React component.</p>
      </SecHead>
      <div data-reveal><PricingPlans /></div>
    </section>
  )
}

function FaqSection() {
  return (
    <section className="wrap section" aria-labelledby="faq-title">
      <div className="sec-label" data-reveal>
        <span className="eyebrow">FAQ</span>
        <span className="eyebrow">07</span>
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20" data-reveal>
        <div className="stack-6 self-start">
          <h2 id="faq-title" className="h2">Questions <em>before you ship.</em></h2>
          <p className="body">Anything else goes to <span className="select-all text-ink">hello@aurashades.example</span>.</p>
        </div>
        <Faq />
      </div>
    </section>
  )
}
