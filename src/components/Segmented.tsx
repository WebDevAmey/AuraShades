import { motion } from 'motion/react'
import { useId } from 'react'
import { cx } from '~/lib/cx'
import { ease } from '~/lib/motion'

type Opt<T extends string> = { value: T; label: React.ReactNode }

/** Pill segmented control with a sliding thumb. Arrow keys move between options. */
export function Segmented<T extends string>({
  options, value, onChange, label, size = 'md', className,
}: {
  options: Opt<T>[]; value: T; onChange: (v: T) => void; label: string; size?: 'sm' | 'md'; className?: string
}) {
  const id = useId()
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const n = options[(i + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length]
    onChange(n.value)
    const el = (e.currentTarget.parentElement?.children[options.indexOf(n)] as HTMLElement | undefined)
    el?.focus()
  }
  return (
    <div role="radiogroup" aria-label={label} className={cx('relative inline-flex rounded-full border border-line bg-panel p-1', className)}>
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(
              'relative flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]',
              size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-[14px]',
              on ? 'text-ground' : 'text-muted hover:text-ink',
            )}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-ink"
                transition={ease}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
