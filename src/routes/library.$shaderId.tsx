import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ShaderEditor, useShaderParams } from '~/components/ShaderEditor'
import { byId, SHADERS } from '~/lib/shaders/library'
import { button } from '~/lib/button'
import { breadcrumbLd, seo, shaderLd } from '~/lib/seo'

export const Route = createFileRoute('/library/$shaderId')({
  loader: ({ params }) => {
    const def = byId(params.shaderId)
    if (!def) throw notFound()
    return { id: def.id }
  },
  head: ({ loaderData }) => {
    const def = loaderData ? byId(loaderData.id) : undefined
    if (!def) return {}
    return seo({
      title: `${def.name}: ${def.style === 'ASCII' ? 'ASCII' : def.style.toLowerCase()} shader background · AuraShades`,
      description: `${def.name} is a live ${def.style === 'ASCII' ? 'ASCII' : def.style.toLowerCase()} shader background: ${def.summary.charAt(0).toLowerCase() + def.summary.slice(1)} Tune it live and copy it as React, GLSL or CSS.`,
      path: `/library/${def.id}`,
      jsonLd: [shaderLd(def), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Library', path: '/library' }, { name: def.name, path: `/library/${def.id}` }])],
    })
  },
  component: ShaderPage,
})

function ShaderPage() {
  const { id } = Route.useLoaderData()
  const def = byId(id)!
  const [params, setParams] = useShaderParams(id)
  const i = SHADERS.findIndex((s) => s.id === id)
  const prev = SHADERS[(i - 1 + SHADERS.length) % SHADERS.length]
  const next = SHADERS[(i + 1) % SHADERS.length]

  return (
    <section className="wrap pt-8 pb-24 md:pt-10" aria-labelledby="shader-title">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-between gap-4">
        <Link to="/library" className={button({ variant: 'ghost', size: 'sm', className: '-ml-3' })}><ArrowLeft size={16} />All shaders</Link>
        <div className="flex gap-2">
          <Link to="/library/$shaderId" params={{ shaderId: prev.id }} className={button({ variant: 'secondary', size: 'sm' })} aria-label={`Previous shader: ${prev.name}`}>
            <ArrowLeft size={15} /><span className="hidden sm:inline">{prev.name}</span>
          </Link>
          <Link to="/library/$shaderId" params={{ shaderId: next.id }} className={button({ variant: 'secondary', size: 'sm' })} aria-label={`Next shader: ${next.name}`}>
            <span className="hidden sm:inline">{next.name}</span><ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Link to="/library" search={{ style: def.style }} className="chip hover:border-line-strong">{def.style}</Link>
            {def.tier === 'pro' ? <span className="chip chip-pro">Pro</span> : <span className="chip">Free</span>}
          </div>
          <h1 id="shader-title" className="display text-[clamp(44px,6vw,84px)]">{def.name}</h1>
        </div>
        <p className="text-[16px] text-ink-2">{def.description}</p>
      </div>

      <ShaderEditor id={id} params={params} setParams={setParams} />
    </section>
  )
}
