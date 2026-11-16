import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ShotCard } from '~/components/ShotCard'
import { Segmented } from '~/components/Segmented'
import { freeCount, SHADERS, STYLES, word, type Style } from '~/lib/shaders/library'
import { breadcrumbLd, libraryLd, seo } from '~/lib/seo'
import { button } from '~/lib/button'

type Filter = Style | 'All'
type Tier = 'all' | 'free' | 'pro'

export const Route = createFileRoute('/library/')({
  validateSearch: (s: Record<string, unknown>): { style?: Style; tier?: Tier; q?: string } => ({
    style: STYLES.some((x) => x.id === s.style) ? (s.style as Style) : undefined,
    tier: s.tier === 'free' || s.tier === 'pro' ? s.tier : undefined,
    q: typeof s.q === 'string' && s.q.trim() ? s.q.slice(0, 60) : undefined,
  }),
  head: () =>
    seo({
      title: 'Shader background library · AuraShades',
      description: `Browse ${SHADERS.length} live WebGL backgrounds: mesh gradients, film grain, pastel washes, aurora, dithering and ASCII. Filter by style and plan.`,
      path: '/library',
      jsonLd: [libraryLd(), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Library', path: '/library' }])],
    }),
  component: Library,
})

const haystack = Object.fromEntries(SHADERS.map((s) => [s.id, `${s.name} ${s.style} ${s.summary} ${s.description}`.toLowerCase()]))
const styleCount = (st: Filter) => (st === 'All' ? SHADERS.length : SHADERS.filter((s) => s.style === st).length)

function Library() {
  const { style, tier, q } = Route.useSearch()
  const navigate = useNavigate({ from: '/library/' })
  const filter: Filter = style ?? 'All'
  const t: Tier = tier ?? 'all'
  const [text, setText] = useState(q ?? '')
  const input = useRef<HTMLInputElement>(null)
  const terms = (q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  const list = SHADERS.filter((s) => (filter === 'All' || s.style === filter) && (t === 'all' || s.tier === t) && terms.every((w) => haystack[s.id].includes(w)))

  const set = (next: { style?: Filter; tier?: Tier; q?: string }) =>
    navigate({
      search: (prev) => {
        const st = next.style ?? prev.style ?? 'All'
        const ti = next.tier ?? prev.tier ?? 'all'
        const qq = next.q !== undefined ? next.q.trim() : prev.q
        return { style: st === 'All' ? undefined : (st as Style), tier: ti === 'all' ? undefined : ti, q: qq || undefined }
      },
      replace: true,
      resetScroll: false,
    })

  // the query follows typing after a short pause, so the URL stays shareable without a submit button
  useEffect(() => {
    if (text.trim() === (q ?? '')) return
    const id = window.setTimeout(() => set({ q: text }), 180)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.key === '/' && document.activeElement?.tagName !== 'INPUT') || (e.key === 'k' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); input.current?.focus() }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const reset = () => { setText(''); set({ style: 'All', tier: 'all', q: '' }) }

  return (
    <section className="wrap page-top" aria-labelledby="lib-title">
      <div className="sec-head !mb-10 md:!mb-12">
        <div className="stack-6">
          <span className="eyebrow"><b>[{String(SHADERS.length).padStart(3, '0')}]</b> Library</span>
          <h1 id="lib-title" className="display">The library</h1>
        </div>
        <p className="lede lg:pb-1">{SHADERS.length} live backgrounds across {word(STYLES.length)} styles, {freeCount} of them free. Every one opens in the editor, free or Pro.</p>
      </div>

      {/* Toolbar: search and plan on one line, styles as a row of pills beneath; sticks under the navbar */}
      <div className="sticky top-[calc(var(--nav-h)+var(--nav-top)*2)] z-30 -mx-3 mb-8 rounded-[var(--r-card)] bg-[color-mix(in_oklab,var(--ground)_82%,transparent)] p-3 shadow-[var(--ring),var(--highlight)] backdrop-blur-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="search h-12 flex-1">
            <Search size={17} aria-hidden="true" />
            <label htmlFor="lib-search" className="sr-only">Search shaders</label>
            <input ref={input} id="lib-search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by name, colour or mood" autoComplete="off" />
            {text ? (
              <button type="button" onClick={() => { setText(''); set({ q: '' }) }} className="grid h-7 w-7 place-items-center rounded-[6px] text-muted hover:text-ink" aria-label="Clear search"><X size={15} /></button>
            ) : (
              <span className="kbd" aria-hidden="true">/</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Segmented size="sm" label="Filter by plan" value={t} onChange={(v) => set({ tier: v })} options={[{ value: 'all', label: 'Any plan' }, { value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]} />
            <p className="spec shrink-0 px-2 text-muted md:min-w-[88px] md:text-right" aria-live="polite">{String(list.length).padStart(2, '0')} / {SHADERS.length}</p>
          </div>
        </div>
        <div className="-mx-3 mt-3 overflow-x-auto px-3 py-0.5 [scrollbar-width:none]">
          <div className="flex gap-1.5" role="group" aria-label="Filter by style">
            {(['All', ...STYLES.map((s) => s.id)] as Filter[]).map((st) => (
              <button key={st} type="button" className="pill" aria-pressed={filter === st} onClick={() => set({ style: st })}>
                {st === 'All' ? 'All styles' : st}
                <span className="n">{styleCount(st)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="board flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
          <p className="h3">Nothing matches {q ? `“${q}”` : 'these filters'}{filter !== 'All' ? ` in ${filter}` : ''}</p>
          <p className="small max-w-[40ch]">Try a colour like blue or gold, a mood like calm, or clear the filters to see the whole set.</p>
          <button type="button" className={button({ variant: 'secondary' })} onClick={reset}>Show every shader</button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((s) => (
            <li key={s.id}>
              <ShotCard id={s.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
