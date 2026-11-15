import { Link, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Wordmark } from './Logo'
import { cx } from '~/lib/cx'
import { ease } from '~/lib/motion'
import { setTheme, startThemeSync, useTheme } from '~/lib/theme'
import { button } from '~/lib/button'

const NAV = [
  { to: '/library', label: 'Library' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/docs', label: 'Docs' },
] as const

export function ThemeToggle() {
  const theme = useTheme()
  const light = theme === 'light'
  return (
    <button
      type="button"
      onClick={() => setTheme(light ? 'dark' : 'light')}
      aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
      className={button({ variant: 'ghost', size: 'sm', icon: true })}
    >
      {light ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const [hover, setHover] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  useEffect(() => startThemeSync(), [])

  const active = (to: string) => path === to || path.startsWith(to + '/')

  return (
    <header
      className={cx(
        'sticky top-0 z-50 transition-[border-color,background-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]',
        scrolled ? 'border-b border-line bg-ground/92 backdrop-blur-md' : 'border-b border-transparent bg-ground',
      )}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="wrap grid h-16 grid-cols-[1fr_auto] items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label="AuraShades home" className="justify-self-start rounded-lg">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden md:block" onMouseLeave={() => setHover(null)}>
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.to} className="relative">
                <Link
                  to={n.to}
                  onMouseEnter={() => setHover(n.to)}
                  onFocus={() => setHover(n.to)}
                  className={cx(
                    'relative z-10 flex h-10 items-center rounded-[10px] px-4 text-[14.5px] font-[520] transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]',
                    active(n.to) ? 'text-ink' : 'text-muted hover:text-ink',
                  )}
                  aria-current={active(n.to) ? 'page' : undefined}
                >
                  {n.label}
                  {active(n.to) && <span className="absolute inset-x-4 -bottom-[12px] h-[2px] rounded-full bg-hot" aria-hidden="true" />}
                </Link>
                {hover === n.to && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-[10px] bg-panel-2"
                    transition={ease}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center justify-self-end gap-2 md:flex">
          <ThemeToggle />
          <Link to="/library" className={button({ variant: 'secondary', size: 'sm' })}>Browse free shaders</Link>
          <Link to="/pricing" className={button({ variant: 'primary', size: 'sm' })}>Get Pro</Link>
        </div>

        <div className="flex items-center justify-self-end gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className={button({ variant: 'ghost', size: 'sm', className: '!h-11 !w-11 !px-0' })}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={ease}
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-ground md:hidden"
          >
            <nav aria-label="Mobile" className="wrap flex h-full flex-col gap-2 pt-6 pb-8">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="flex min-h-16 items-center border-b border-line font-display text-[34px] font-[650] tracking-[-0.03em]">
                  {n.label}
                </Link>
              ))}
              <div className="mt-auto grid gap-3">
                <Link to="/library" className={button({ variant: 'secondary', className: 'w-full' })}>Browse free shaders</Link>
                <Link to="/pricing" className={button({ variant: 'primary', className: 'w-full' })}>Get Pro</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
