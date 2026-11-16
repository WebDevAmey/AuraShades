import Lenis from 'lenis'
import { useEffect } from 'react'

/** Runs before first paint: arms scroll reveals only when motion is allowed, so nothing hides without JS. */
export const motionInitScript = `(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}})();`

/**
 * Site-wide feel: Lenis smooth scrolling on wheel and trackpad (touch keeps native scrolling),
 * and one rise-out-of-blur reveal per [data-reveal] block as it enters the viewport.
 */
export function useSmoothSite(path: string) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: { offset: -96 }, autoRaf: true })
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    return () => lenis.destroy()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (!root.classList.contains('motion')) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not(.in)').forEach((n) => io.observe(n))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [path])
}
