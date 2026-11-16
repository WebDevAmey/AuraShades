import { useEffect } from 'react'

/** Runs before first paint: arms scroll reveals only when motion is allowed, so nothing hides without JS. */
export const motionInitScript = `(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}})();`

/**
 * One short rise per [data-reveal] block as it enters the viewport. Scrolling itself stays native:
 * the browser's own scroller is the smoothest one on every device.
 */
export function useReveal(path: string) {
  useEffect(() => {
    const root = document.documentElement
    if (!root.classList.contains('motion')) return
    if (!('IntersectionObserver' in window)) { document.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('in')); return }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not(.in)').forEach((n) => io.observe(n))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.getElementById('main') ?? document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [path])
}
