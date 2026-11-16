import { Link, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { LogoMark } from './Logo'
import { AuraShade } from './AuraShade'
import { cx } from '~/lib/cx'
import { setTheme, startThemeSync, useTheme } from '~/lib/theme'
import { byId, SHADERS, STYLES, word } from '~/lib/shaders/library'

/*
  The navbar is a port of Amey's Morphing Navbar: one dark shell. Closed, it is the bar;
  open, the same shell grows to the active panel and reshapes between panels. Panels sit
  inside a layer clipped exactly like the shell, so nothing shows outside it while it shrinks.
  Spacing is one 8px unit; shapes move on a long, soft deceleration (560ms open, 320ms close).
*/

const FEATURED = ['signal-mosaic', 'gilded-chrome', 'prism-flow']
const RESOURCES = [
  { to: '/docs', hash: 'install', t: 'Install', s: 'One package, two minutes' },
  { to: '/docs', hash: 'props', t: 'Component props', s: 'Palette, speed, scale, grain' },
  { to: '/docs', hash: 'performance', t: 'Performance', s: 'One WebGL context per page' },
  { to: '/pricing', hash: 'licence', t: 'Licence', s: 'What each plan covers' },
] as const
const TRIGGERS = [
  { label: 'Library', match: '/library' },
  { label: 'Styles', match: '' },
  { label: 'Docs', match: '/docs' },
] as const

const swatch = (style: string) => {
  const p = SHADERS.find((s) => s.style === style)!.palettes.dark
  return { background: `radial-gradient(80% 90% at 20% 20%, ${p[2]}, transparent 70%), radial-gradient(70% 80% at 90% 90%, ${p[3]}, transparent 70%), ${p[1]}` }
}
const count = (style: string) => SHADERS.filter((s) => s.style === style).length

function Arrow() {
  const a = (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  )
  return <i className="mnav-arrow" aria-hidden="true">{a}{a}</i>
}

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 4 5 6.5 7.5 4" />
    </svg>
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme()
  const light = theme === 'light'
  return (
    <button type="button" onClick={() => setTheme(light ? 'dark' : 'light')} aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'} className={cx('mnav-icon', className)}>
      {light ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}

/** "Get Pro": the letters flip-roll over one after another on hover. */
function RollCta({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const [rolled, setRolled] = useState(false)
  const [reset, setReset] = useState(false)
  const busy = useRef(false)
  const text = 'Get Pro'
  const flip = () => {
    if (busy.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    busy.current = true
    setRolled(true)
    window.setTimeout(() => {
      setReset(true)
      setRolled(false)
      requestAnimationFrame(() => requestAnimationFrame(() => { setReset(false); busy.current = false }))
    }, 560 + 16 * text.length + 40)
  }
  return (
    <Link to="/pricing" className={cx('mnav-cta', rolled && 'rolled', className)} aria-label={text} onPointerEnter={(e) => e.pointerType === 'mouse' && flip()} onFocus={flip} onClick={onNavigate}>
      <span className={cx('roll', reset && 'reset')} aria-hidden="true">
        {[...text].map((c, k) => (
          <span key={k} className="ch" data-c={c} style={{ '--k': k } as CSSProperties}>
            <span>{c === ' ' ? ' ' : c}</span>
          </span>
        ))}
      </span>
    </Link>
  )
}

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname })
  useEffect(() => startThemeSync(), [])
  return (
    <header style={{ position: 'relative', zIndex: 60 }}>
      <DesktopNav path={path} />
      <MobileNav path={path} />
    </header>
  )
}

function DesktopNav({ path }: { path: string }) {
  const nav = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const shell = useRef<HTMLDivElement>(null)
  const clip = useRef<HTMLDivElement>(null)
  const links = useRef<HTMLDivElement>(null)
  const hl = useRef<HTMLSpanElement>(null)
  const panels = useRef<(HTMLElement | null)[]>([])
  const triggers = useRef<(HTMLButtonElement | null)[]>([])
  const geo = useRef({ boxes: [] as { l: number; w: number; h: number }[], bounds: { l: 0, r: 0, h: 0 }, barW: 0, barH: 0 })
  const [active, setActive] = useState(-1)
  const [dx, setDx] = useState<number[]>([0, 0, 0])
  const activeRef = useRef(-1)
  const timers = useRef({ open: 0, close: 0 })

  const apply = useCallback((a: number) => {
    const { boxes, bounds, barW, barH } = geo.current
    let l = -barW / 2, r = barW / 2, h = barH
    if (a >= 0 && boxes[a]) { const b = boxes[a]; l = Math.min(l, b.l); r = Math.max(r, b.l + b.w); h = barH + b.h }
    for (const el of [shell.current, clip.current]) {
      if (!el) continue
      el.style.setProperty('--cl', `${l - bounds.l}px`)
      el.style.setProperty('--cr', `${bounds.r - r}px`)
      el.style.setProperty('--cy', `${bounds.h - h}px`)
    }
  }, [])

  const measure = useCallback(() => {
    if (!bar.current || !wrap.current || !nav.current) return
    const barW = bar.current.offsetWidth, barH = bar.current.offsetHeight
    const boxes = panels.current.map((p) => (p ? { l: -p.offsetWidth / 2, w: p.offsetWidth, h: p.offsetHeight } : { l: 0, w: 0, h: 0 }))
    const bounds = { l: Math.min(-barW / 2, ...boxes.map((b) => b.l)), r: Math.max(barW / 2, ...boxes.map((b) => b.l + b.w)), h: barH + Math.max(...boxes.map((b) => b.h)) }
    const W = bounds.r - bounds.l
    Object.assign(wrap.current.style, { left: `${barW / 2 + bounds.l}px`, width: `${W}px`, height: `${bounds.h}px` })
    if (clip.current) Object.assign(clip.current.style, { width: `${W}px`, height: `${bounds.h}px` })
    nav.current.style.width = `${barW}px`
    panels.current.forEach((p, i) => { if (p) p.style.left = `${boxes[i].l - bounds.l}px` })
    geo.current = { boxes, bounds, barW, barH }
    apply(activeRef.current)
    nav.current.classList.add('ready')
  }, [apply])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (bar.current) ro.observe(bar.current)
    panels.current.forEach((p) => p && ro.observe(p))
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [measure])

  const glideTo = (i: number) => {
    const t = triggers.current[i]
    if (!t || !hl.current || !links.current) return
    hl.current.style.setProperty('--hx', `${t.offsetLeft}px`)
    hl.current.style.setProperty('--hw', `${t.offsetWidth}px`)
    links.current.classList.add('hovering')
  }

  const show = useCallback((i: number) => {
    window.clearTimeout(timers.current.close)
    const prev = activeRef.current
    if (i === prev) return
    // the incoming panel slides in from the side it lives on; the outgoing one leaves the other way
    setDx(TRIGGERS.map((_, k) => (prev < 0 ? 0 : k === i ? (i > prev ? 12 : -12) : k === prev ? (i > prev ? -12 : 12) : 0)))
    activeRef.current = i
    setActive(i)
    apply(i)
  }, [apply])

  const hide = useCallback(() => {
    if (activeRef.current < 0) return
    setDx([0, 0, 0])
    activeRef.current = -1
    setActive(-1)
    apply(-1)
    links.current?.classList.remove('hovering')
  }, [apply])

  const scheduleClose = () => {
    window.clearTimeout(timers.current.open)
    window.clearTimeout(timers.current.close)
    timers.current.close = window.setTimeout(hide, 200)
  }

  useEffect(() => hide(), [path, hide])
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeRef.current >= 0) { const t = triggers.current[activeRef.current]; hide(); t?.focus() }
    }
    const down = (e: PointerEvent) => { if (nav.current && !nav.current.contains(e.target as Node)) hide() }
    document.addEventListener('keydown', esc)
    document.addEventListener('pointerdown', down)
    return () => { document.removeEventListener('keydown', esc); document.removeEventListener('pointerdown', down) }
  }, [hide])

  const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches

  return (
    <nav
      ref={nav}
      aria-label="Main"
      className={cx('mnav hidden md:block', active >= 0 && 'open')}
      onPointerEnter={() => window.clearTimeout(timers.current.close)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && scheduleClose()}
      onBlur={(e) => { if (e.relatedTarget && !nav.current?.contains(e.relatedTarget as Node)) hide() }}
    >
      <div ref={wrap} className="mnav-shell-wrap">
        <div ref={shell} className="mnav-shell" aria-hidden="true" />
        <div ref={clip} className="mnav-clip">
          <div className="mnav-stage">
            {/* 0 · library: three live tiles and a way into the whole set */}
            <section ref={(el) => { panels.current[0] = el }} id="mnav-p0" aria-label="Library" className={cx('mnav-panel', active === 0 && 'active')} style={{ '--dx': `${dx[0]}px` } as CSSProperties} inert={active !== 0}>
              <div className="mnav-reel">
                {FEATURED.map((id, k) => {
                  const s = byId(id)!
                  return (
                    <Link key={id} to="/library/$shaderId" params={{ shaderId: id }} className="mnav-shot stag" style={{ '--i': k } as CSSProperties}>
                      <span className="media block">{active === 0 && <span className="absolute inset-0"><AuraShade shader={id} params={{ palette: [...s.palettes.dark] as [string, string, string, string] }} dprCap={1} label={`${s.name} preview`} /></span>}</span>
                      <span className="cap"><span>{s.name}</span><span>{s.style}</span></span>
                    </Link>
                  )
                })}
              </div>
              <div className="mnav-foot stag" style={{ '--i': 3 } as CSSProperties}>
                <span>{SHADERS.length} shaders in {word(STYLES.length)} styles, all live</span>
                <Link to="/library">Browse the library <ArrowRight size={14} /></Link>
              </div>
            </section>

            {/* 1 · styles: every style, a swatch and its count */}
            <section ref={(el) => { panels.current[1] = el }} id="mnav-p1" aria-label="Styles" className={cx('mnav-panel', active === 1 && 'active')} style={{ '--dx': `${dx[1]}px` } as CSSProperties} inert={active !== 1}>
              <GlideList className="three">
                {STYLES.map((s, k) => (
                  <Link key={s.id} to="/library" search={{ style: s.id }} className="mnav-item stag" style={{ '--i': k } as CSSProperties}>
                    <i className="sw" style={swatch(s.id)} aria-hidden="true" />
                    <span><b>{s.id}</b></span>
                    <span className="n">{String(count(s.id)).padStart(2, '0')}</span>
                  </Link>
                ))}
              </GlideList>
            </section>

            {/* 2 · docs */}
            <section ref={(el) => { panels.current[2] = el }} id="mnav-p2" aria-label="Docs" className={cx('mnav-panel', active === 2 && 'active')} style={{ '--dx': `${dx[2]}px` } as CSSProperties} inert={active !== 2}>
              <GlideList className="two">
                {RESOURCES.map((r, k) => (
                  <Link key={r.t} to={r.to} hash={r.hash} className="mnav-item stag" style={{ '--i': k } as CSSProperties}>
                    <span><b>{r.t}</b><small>{r.s}</small></span>
                    <Arrow />
                  </Link>
                ))}
              </GlideList>
            </section>
          </div>
        </div>
      </div>

      <div ref={bar} className="mnav-bar">
        <Link to="/" className="mnav-mark" aria-label="AuraShades home">
          <LogoMark size={22} className="text-[var(--p-cyan)]" />
          AuraShades
        </Link>
        <div ref={links} className="mnav-links" onPointerLeave={() => { window.clearTimeout(timers.current.open); if (activeRef.current < 0) links.current?.classList.remove('hovering'); else glideTo(activeRef.current) }}>
          <span ref={hl} className="mnav-hl" aria-hidden="true" />
          {TRIGGERS.map((t, i) => (
            <button
              key={t.label}
              ref={(el) => { triggers.current[i] = el }}
              type="button"
              className="mnav-trigger"
              aria-expanded={active === i}
              aria-controls={`mnav-p${i}`}
              data-current={t.match && (path === t.match || path.startsWith(t.match + '/')) ? '' : undefined}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse' || !fine()) return
                glideTo(i)
                window.clearTimeout(timers.current.open)
                window.clearTimeout(timers.current.close)
                timers.current.open = window.setTimeout(() => show(i), activeRef.current < 0 ? 80 : 50)
              }}
              onClick={() => { glideTo(i); activeRef.current === i ? hide() : show(i) }}
              onFocus={() => glideTo(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); show(i); window.setTimeout(() => panels.current[i]?.querySelector<HTMLElement>('a,button')?.focus(), 60) }
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault()
                  const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + TRIGGERS.length) % TRIGGERS.length
                  triggers.current[n]?.focus(); glideTo(n); if (activeRef.current >= 0) show(n)
                }
              }}
            >
              {t.label} <Chevron />
            </button>
          ))}
          <Link
            to="/pricing"
            className="mnav-trigger"
            data-current={path === '/pricing' ? '' : undefined}
            onPointerEnter={(e) => { if (e.pointerType === 'mouse' && hl.current && links.current) { const el = e.currentTarget; hl.current.style.setProperty('--hx', `${el.offsetLeft}px`); hl.current.style.setProperty('--hw', `${el.offsetWidth}px`); links.current.classList.add('hovering'); scheduleClose() } }}
          >
            Pricing
          </Link>
        </div>
        <ThemeToggle className="ml-1" />
        <RollCta />
      </div>
    </nav>
  )
}

/** A list with one highlight that glides between its items. */
function GlideList({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const glide = useRef<HTMLSpanElement>(null)
  const to = (a: HTMLElement) => {
    const g = glide.current
    if (!g || !ref.current) return
    g.style.setProperty('--gx', `${a.offsetLeft}px`); g.style.setProperty('--gy', `${a.offsetTop}px`)
    g.style.setProperty('--gw', `${a.offsetWidth}px`); g.style.setProperty('--gh', `${a.offsetHeight}px`)
    ref.current.classList.add('hovering')
  }
  return (
    <div
      ref={ref}
      className={cx('mnav-list', className)}
      onPointerOver={(e) => { const a = (e.target as HTMLElement).closest<HTMLElement>('.mnav-item'); if (a) to(a) }}
      onFocus={(e) => { const a = (e.target as HTMLElement).closest<HTMLElement>('.mnav-item'); if (a) to(a) }}
      onPointerLeave={() => ref.current?.classList.remove('hovering')}
    >
      <span ref={glide} className="mnav-glide" aria-hidden="true" />
      {children}
    </div>
  )
}

/* Phones: the same shell, opened downward into the full menu. */
function MobileNav({ path }: { path: string }) {
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])
  const close = () => setOpen(false)
  return (
    <div className="md:hidden">
      <AnimatePresence>
        {open && <motion.div key="scrim" className="mnav-mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }} onClick={close} />}
      </AnimatePresence>
      <motion.div className="mnav-sheet" initial={false} animate={{ height: open ? 'auto' : 56 }} transition={{ duration: open ? 0.56 : 0.32, ease: open ? [0.32, 0.72, 0, 1] : [0.23, 1, 0.32, 1] }}>
        <div className="flex h-14 items-center gap-1 p-2">
          <Link to="/" className="mnav-mark" aria-label="AuraShades home" onClick={close}>
            <LogoMark size={22} className="text-[var(--p-cyan)]" />
            AuraShades
          </Link>
          <span className="flex-1" />
          <ThemeToggle />
          <button type="button" className="mnav-icon" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav id="mobile-menu" aria-label="Mobile" className="flex flex-col gap-1 px-2 pb-2" inert={!open}>
          {[
            { to: '/library' as const, label: 'Library', s: `${SHADERS.length} live shaders` },
            { to: '/pricing' as const, label: 'Pricing', s: 'Free, Pro and Team' },
            { to: '/docs' as const, label: 'Docs', s: 'Install and props' },
          ].map((n) => (
            <Link key={n.to} to={n.to} onClick={close} className="flex min-h-16 items-center justify-between rounded-[12px] bg-[var(--shell-raise)] px-4">
              <span className="font-display text-[26px] font-[800] uppercase italic tracking-[-0.03em]">{n.label}</span>
              <span className="text-[13px] text-white/45">{n.s}</span>
            </Link>
          ))}
          <div className="mt-1 grid grid-cols-2 gap-1">
            {STYLES.slice(0, 8).map((s) => (
              <Link key={s.id} to="/library" search={{ style: s.id }} onClick={close} className="flex h-12 items-center gap-3 rounded-[12px] px-3 text-[14px] text-white/80">
                <i className="h-6 w-6 shrink-0 rounded-[6px]" style={swatch(s.id)} aria-hidden="true" />
                {s.id}
              </Link>
            ))}
          </div>
          <RollCta className="mt-1 !ml-0 h-12 justify-center" onNavigate={close} />
        </nav>
      </motion.div>
    </div>
  )
}
