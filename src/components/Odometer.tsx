import { useEffect, useRef, useState, type CSSProperties } from 'react'

/** A figure whose digits roll into place when it scrolls into view; columns settle 45ms apart. */
export function Odometer({ value, pad = 2, className }: { value: number; pad?: number; className?: string }) {
  const digits = String(value).padStart(pad, '0').split('').map(Number)
  const ref = useRef<HTMLSpanElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setOn(true)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <span ref={ref} className={className} aria-label={String(value)} role="img">
      <span className="odo" aria-hidden="true">
        {digits.map((d, i) => (
          <span key={i} className="odo-col" style={{ '--v': on ? d : 0, '--i': i } as CSSProperties}>
            {Array.from({ length: 10 }, (_, n) => <span key={n}>{n}</span>)}
          </span>
        ))}
      </span>
    </span>
  )
}
