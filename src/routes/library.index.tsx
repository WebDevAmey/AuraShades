import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { AuraShade } from '~/components/AuraShade'
import { Segmented } from '~/components/Segmented'
import { SHADERS, STYLES, word, type Style } from '~/lib/shaders/library'
import { breadcrumbLd, libraryLd, seo } from '~/lib/seo'
import { button } from '~/lib/button'

type Filter = Style | 'All'
type Tier = 'all' | 'free' | 'pro'

export const Route = createFileRoute('/library/')({
  validateSearch: (s: Record<string, unknown>): { style?: Style; tier?: Tier } => ({
    style: STYLES.some((x) => x.id === s.style) ? (s.style as Style) : undefined,
    tier: s.tier === 'free' || s.tier === 'pro' ? s.tier : undefined,
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

function Library() {
  const { style, tier } = Route.useSearch()
  const navigate = useNavigate({ from: '/library/' })
  const filter: Filter = style ?? 'All'
  const t: Tier = tier ?? 'all'
  const list = SHADERS.filter((s) => (filter === 'All' || s.style === filter) && (t === 'all' || s.tier === t))
  const set = (next: { style?: Filter; tier?: Tier }) =>
    navigate({
      search: (prev) => {
        const st = next.style ?? prev.style ?? 'All'
        const ti = next.tier ?? prev.tier ?? 'all'
        return { style: st === 'All' ? undefined : (st as Style), tier: ti === 'all' ? undefined : ti }
      },
      replace: true,
      resetScroll: false,
    })

  return (
    <section className="wrap pt-12 pb-24 md:pt-16" aria-labelledby="lib-title">
      <div className="flex flex-col gap-5">
        <h1 id="lib-title" className="display text-[clamp(44px,6vw,84px)]">The library</h1>
        <p className="lede">{SHADERS.length} live backgrounds across {word(STYLES.length)} styles. Every one opens in the editor, free or Pro.</p>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
          <Segmented
            size="sm"
            label="Filter by style"
            value={filter}
            onChange={(v) => set({ style: v })}
            options={[{ value: 'All', label: 'All styles' }, ...STYLES.map((s) => ({ value: s.id as Filter, label: s.id }))]}
          />
        </div>
        <Segmented
          size="sm"
          label="Filter by plan"
          value={t}
          onChange={(v) => set({ tier: v })}
          options={[{ value: 'all', label: 'Any plan' }, { value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]}
          className="self-start"
        />
      </div>

      <p className="small mt-4 tnum" aria-live="polite">Showing {list.length} of {SHADERS.length}</p>

      {list.length === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-[20px] border border-dashed border-line-strong p-10">
          <p className="h3">No {filter} shaders on the {t} plan yet</p>
          <button type="button" className={button({ variant: 'secondary' })} onClick={() => set({ style: 'All', tier: 'all' })}>Show every shader</button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <li key={s.id}>
              <Link to="/library/$shaderId" params={{ shaderId: s.id }} className="group flex flex-col gap-4 rounded-[18px]">
                <span className="tile aspect-[4/3]">
                  <span className="absolute inset-0"><AuraShade shader={s.id} label={`${s.name} preview`} /></span>
                </span>
                <span className="flex items-start justify-between gap-3 px-1">
                  <span className="min-w-0">
                    <span className="block font-display text-[19px] font-semibold tracking-[-0.01em]">{s.name}</span>
                    <span className="block text-[14.5px] text-muted">{s.summary}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="chip">{s.style}</span>
                    {s.tier === 'pro' && <span className="chip chip-pro">Pro</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
