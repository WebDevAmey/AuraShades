import { useSyncExternalStore } from 'react'

/**
 * One source of truth for the site theme.
 *
 * - The resolved theme always lives on <html data-theme="dark|light">, so CSS has
 *   exactly one light block and one dark default, on every page.
 * - A visitor's explicit choice is stored; with no choice, the site follows the
 *   operating system and keeps following it if the system setting changes.
 * - Every toggle, shader preset and meta tag reads the same value via useTheme().
 */

export type Theme = 'dark' | 'light'

const KEY = 'aurashades-theme'
const BAR: Record<Theme, string> = { dark: '#0d0f14', light: '#f2f3f5' }

/** Runs inline in <head> before first paint, so no page ever flashes the wrong theme. */
export const themeInitScript = `(function(){try{var d=document.documentElement,s=localStorage.getItem('${KEY}'),t=s==='light'||s==='dark'?s:(d.dataset.theme==='light'||d.dataset.theme==='dark'?d.dataset.theme:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));d.dataset.theme=t;d.style.colorScheme=t;}catch(e){}})();`

const read = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function apply(t: Theme) {
  const d = document.documentElement
  d.dataset.theme = t
  d.style.colorScheme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR[t])
}

/** Set an explicit theme, remembered for this visitor. */
export function setTheme(t: Theme) {
  try { localStorage.setItem(KEY, t) } catch {}
  const swap = () => apply(t)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return swap()
  // Cross-fade the whole page in one 300ms beat; fall back to fading colours.
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  if (doc.startViewTransition) return void doc.startViewTransition(swap)
  const root = document.documentElement
  root.classList.add('theme-fade')
  swap()
  window.setTimeout(() => root.classList.remove('theme-fade'), 320)
}

let started = false
/** Call once on the client: syncs the meta colour and follows the OS until the visitor picks a theme. */
export function startThemeSync() {
  if (started || typeof window === 'undefined') return
  started = true
  apply(stored() ?? read())
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!stored()) apply(e.matches ? 'light' : 'dark')
  })
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && (e.newValue === 'light' || e.newValue === 'dark')) apply(e.newValue)
  })
}

function subscribe(fn: () => void) {
  const mo = new MutationObserver(fn)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}

/** The active theme. Every component that depends on it reads it here. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => 'dark')
}
