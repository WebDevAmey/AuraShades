import { Link } from '@tanstack/react-router'
import { Check, Copy, Lock, RotateCcw, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AuraShade } from './AuraShade'
import { Segmented } from './Segmented'
import { byId, defaultsFor, shufflePalettes, type ShaderParams } from '~/lib/shaders/library'
import { useTheme } from '~/lib/theme'
import { exportCSS, exportGLSL, exportReact } from '~/lib/shaders/glsl'
import { cx } from '~/lib/cx'
import { button } from '~/lib/button'

type Format = 'react' | 'glsl' | 'css'

/** Editor state for a shader. Resets to the theme's palette when the shader or the site theme changes. */
export function useShaderParams(id: string) {
  const theme = useTheme()
  const [params, setParams] = useState<ShaderParams>(() => defaultsFor(byId(id)!, theme))
  useEffect(() => setParams(defaultsFor(byId(id)!, theme)), [id, theme])
  return [params, setParams] as const
}

export function ShaderEditor({ id, params, setParams, layout = 'full' }: {
  id: string
  params: ShaderParams
  setParams: React.Dispatch<React.SetStateAction<ShaderParams>>
  layout?: 'full' | 'frame'
}) {
  const def = byId(id)!
  const theme = useTheme()
  const [format, setFormat] = useState<Format>('react')
  const [copied, setCopied] = useState(false)

  const code = useMemo(() => {
    if (format === 'react') return exportReact(def, params)
    if (format === 'glsl') return exportGLSL(def, params)
    return exportCSS(def, params)
  }, [def, params, format])

  const locked = format === 'react' || (def.tier === 'pro' && format === 'glsl')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success(format === 'css' ? 'CSS palette copied' : format === 'glsl' ? 'GLSL copied' : 'React component copied')
      setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('Your browser blocked the clipboard. Select the code and copy it by hand.')
    }
  }

  const shuffle = () => {
    const opts = shufflePalettes(def.style, theme).filter((p) => p.join() !== params.palette.join())
    const pick = opts[Math.floor(Math.random() * opts.length)]
    setParams((p) => ({ ...p, palette: pick as ShaderParams['palette'] }))
  }

  const sliders: { k: keyof ShaderParams; label: string; min: number; max: number; step: number; fmt: (n: number) => string }[] = [
    { k: 'speed', label: 'Speed', min: 0, max: 1.5, step: 0.01, fmt: (n) => n.toFixed(2) + '×' },
    { k: 'scale', label: 'Scale', min: 0.4, max: 2.5, step: 0.01, fmt: (n) => n.toFixed(2) },
    def.cellular
      ? { k: 'cell', label: def.cellular === 'glyph' ? 'Character size' : 'Dot size', min: def.cellular === 'glyph' ? 5 : 2, max: def.cellular === 'glyph' ? 20 : 12, step: 1, fmt: (n) => `${n}px` }
      : { k: 'grain', label: 'Grain', min: 0, max: 0.35, step: 0.005, fmt: (n) => (n * 100).toFixed(0) + '%' },
  ]

  const controls = (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-ink-2">Palette</span>
          <div className="flex gap-1">
            <button type="button" onClick={shuffle} className={button({ variant: 'ghost', size: 'sm', className: '!h-8 !px-2.5 !text-[13px]' })}><Shuffle size={14} />Shuffle</button>
            <button type="button" onClick={() => setParams(defaultsFor(def, theme))} className={button({ variant: 'ghost', size: 'sm', className: '!h-8 !px-2.5 !text-[13px]' })}><RotateCcw size={14} />Reset</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {params.palette.map((c, i) => (
            <div key={i} className="flex min-w-0 flex-col gap-1.5">
              <label className="swatch" style={{ background: c }}>
                <span className="sr-only">Colour {i + 1}</span>
                <input
                  type="color"
                  value={c}
                  onChange={(e) => setParams((p) => { const pal = [...p.palette] as ShaderParams['palette']; pal[i] = e.target.value; return { ...p, palette: pal } })}
                />
              </label>
              <span className="truncate text-center font-mono text-[11px] uppercase text-muted">{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sliders.map((s) => {
          const v = params[s.k] as number
          const fill = ((v - s.min) / (s.max - s.min)) * 100
          return (
            <div key={s.k} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[14px]">
                <label htmlFor={`${layout}-${s.k}`} className="text-ink-2">{s.label}</label>
                <output htmlFor={`${layout}-${s.k}`} className="tnum font-mono text-[12.5px] text-muted">{s.fmt(v)}</output>
              </div>
              <input
                id={`${layout}-${s.k}`}
                type="range"
                className="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={v}
                style={{ ['--fill' as string]: `${fill}%` }}
                onChange={(e) => setParams((p) => ({ ...p, [s.k]: +e.target.value }))}
              />
            </div>
          )
        })}
      </div>
    </div>
  )

  const codePanel = (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented
          size="sm"
          label="Export format"
          value={format}
          onChange={setFormat}
          options={[{ value: 'react', label: 'React' }, { value: 'glsl', label: 'GLSL' }, { value: 'css', label: 'CSS' }]}
        />
        {locked ? (
          <Link to="/pricing" className={button({ variant: 'secondary', size: 'sm', className: '!h-9' })}><Lock size={14} />Unlock with Pro</Link>
        ) : (
          <button type="button" onClick={copy} className={button({ variant: 'primary', size: 'sm', className: '!h-9 min-w-[104px]' })}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy code'}
          </button>
        )}
      </div>
      <div className="relative">
        <pre className={cx('code', layout === 'frame' ? 'h-[210px]' : 'h-[300px]')} tabIndex={0} aria-label={`${format} code`}>
          <code>{code}</code>
        </pre>
        {locked && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[14px] bg-gradient-to-t from-[var(--code-bg)] to-transparent" aria-hidden="true" />
        )}
      </div>
      <p className="small">
        {format === 'react' && 'The React component is part of Pro. Free plans can copy GLSL and CSS for free shaders.'}
        {format === 'glsl' && (def.tier === 'pro' ? 'This is a Pro shader. Preview it freely; copying needs Pro.' : 'Paste into any WebGL 1 fragment shader. Set uRes and uTime each frame.')}
        {format === 'css' && 'Palette tokens plus a static gradient fallback for print and no-WebGL browsers.'}
      </p>
    </div>
  )

  if (layout === 'frame') {
    return (
      <div className="grid min-w-0 gap-5 p-4 md:p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="relative aspect-[16/11] min-w-0 overflow-hidden rounded-[14px] border border-line">
          <div className="absolute inset-0"><AuraShade shader={id} params={params} /></div>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          {controls}
          {codePanel}
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="relative aspect-[16/10] min-w-0 overflow-hidden rounded-[22px] border border-line">
          <div className="absolute inset-0"><AuraShade shader={id} params={params} dprCap={1.75} /></div>
        </div>
        {codePanel}
      </div>
      <aside className="panel h-max p-6 lg:sticky lg:top-[92px]">{controls}</aside>
    </div>
  )
}
