import { createFileRoute, Link } from '@tanstack/react-router'
import { CHANGELOG } from '~/lib/changelog'
import { breadcrumbLd, seo, SITE } from '~/lib/seo'
import { byId } from '~/lib/shaders/library'

export const Route = createFileRoute('/changelog')({
  head: () =>
    seo({
      title: 'Changelog · AuraShades',
      description: `New shaders, engine changes and site updates for AuraShades, newest first. Latest: ${CHANGELOG[0].title} (${CHANGELOG[0].date}).`,
      path: '/changelog',
      jsonLd: [
        breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Changelog', path: '/changelog' }]),
        {
          '@type': 'ItemList',
          name: 'AuraShades changelog',
          itemListElement: CHANGELOG.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: `${r.date}: ${r.title}`, url: `${SITE.url}/changelog#${anchor(r.date, r.title)}` })),
        },
      ],
    }),
  component: ChangelogPage,
})

const anchor = (d: string, t: string) => `${d}-${t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
const fmt = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

function ChangelogPage() {
  return (
    <section className="wrap page-top" aria-labelledby="cl-title">
      <div className="sec-head">
        <div className="stack-6">
          <span className="eyebrow">Changelog</span>
          <h1 id="cl-title" className="display">What <em>shipped</em></h1>
        </div>
        <p className="lede lg:pb-2">New shaders, engine changes and site updates, newest first.</p>
      </div>

      <ol className="flex flex-col">
        {CHANGELOG.map((r) => {
          const id = anchor(r.date, r.title)
          const shaders = (r.shaders ?? []).map(byId).filter((s): s is NonNullable<typeof s> => !!s)
          return (
            <li key={id} id={id} className="grid scroll-mt-28 gap-6 border-t border-line py-12 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
              <div className="flex flex-row items-center gap-3 md:flex-col md:items-start md:gap-2">
                <time dateTime={r.date} className="spec text-ink">{fmt(r.date)}</time>
                <span className="chip">{r.tag}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-5">
                <h2 className="text-[26px] font-[560] leading-[1.15] tracking-[-0.035em]"><a href={`#${id}`} className="text-ink no-underline">{r.title}</a></h2>
                <ul className="flex max-w-[64ch] flex-col gap-2.5">
                  {r.notes.map((n) => (
                    <li key={n} className="body flex gap-3"><span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden="true" />{n}</li>
                  ))}
                </ul>
                {shaders.length > 0 && (
                  <ul className="mt-1 flex flex-wrap gap-2" aria-label="Shaders in this release">
                    {shaders.map((s) => (
                      <li key={s.id}>
                        <Link to="/library/$shaderId" params={{ shaderId: s.id }} className="pill !pl-1.5">
                          <span className="block h-6 w-6 overflow-hidden rounded-full">
                            <i className="block h-full w-full" style={{ background: `radial-gradient(90% 90% at 25% 25%, ${s.palettes.dark[3]}, transparent 60%), linear-gradient(135deg, ${s.palettes.dark[1]}, ${s.palettes.dark[2]})` }} />
                          </span>
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
