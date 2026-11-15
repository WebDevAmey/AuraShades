import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ShotCard } from '~/components/ShotCard'
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
    <section className="wrap page-end pt-10 md:pt-14" aria-labelledby="lib-title">
      <div className="stack-6 max-w-3xl">
        <h1 id="lib-title" className="display">The library</h1>
        <p className="lede">{SHADERS.length} live backgrounds across {word(STYLES.length)} styles. Every one opens in the editor, free or Pro.</p>
      </div>

      <div className="board mt-10 flex flex-col gap-3 !p-3 md:mt-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
          <Segmented
            size="sm"
            label="Filter by style"
            value={filter}
            onChange={(v) => set({ style: v })}
            options={[{ value: 'All', label: 'All styles' }, ...STYLES.map((s) => ({ value: s.id as Filter, label: s.id }))]}
          />
        </div>
        <div>
          <Segmented
            size="sm"
            label="Filter by plan"
            value={t}
            onChange={(v) => set({ tier: v })}
            options={[{ value: 'all', label: 'Any plan' }, { value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]}
          />
        </div>
      </div>

      <p className="small tnum mt-6 mb-4" aria-live="polite">Showing {list.length} of {SHADERS.length}</p>

      {list.length === 0 ? (
        <div className="board flex flex-col items-start gap-4 border-dashed">
          <p className="h3">No {filter} shaders on the {t} plan yet</p>
          <button type="button" className={button({ variant: 'secondary' })} onClick={() => set({ style: 'All', tier: 'all' })}>Show every shader</button>
        </div>
      ) : (
        <ul className="boards sm:grid-cols-2 lg:grid-cols-3">
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
