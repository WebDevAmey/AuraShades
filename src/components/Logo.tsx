import { useId } from 'react'

/**
 * The AuraShades mark: a disc whose lower half breaks into scanline bands,
 * light passing through a shader. Drawn on a 32 grid; inherits currentColor.
 */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <defs>
        <clipPath id={id}>
          <circle cx="16" cy="16" r="13" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="currentColor">
        <rect x="0" y="0" width="32" height="16" />
        <rect x="0" y="17.75" width="32" height="3.25" />
        <rect x="0" y="22.75" width="32" height="2.25" />
        <rect x="0" y="26.75" width="32" height="1.5" />
      </g>
    </svg>
  )
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={24} className="text-hot" />
      <span className="font-display text-[18px] font-[680] tracking-[-0.03em]">AuraShades</span>
    </span>
  )
}
