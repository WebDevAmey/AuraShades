import { useEffect, useRef, useSyncExternalStore } from 'react'
import { byId, defaultsFor, type ShaderParams } from '~/lib/shaders/library'
import { useTheme } from '~/lib/theme'
import { getEngine } from '~/lib/shaders/engine'
import { cx } from '~/lib/cx'

type Props = {
  shader: string
  params?: Partial<ShaderParams>
  className?: string
  label?: string
  dprCap?: number
}

/** A live shader background. Every instance shares one WebGL context. */
export function AuraShade({ shader, params, className, label, dprCap = 1.5 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const def = byId(shader)
  const theme = useTheme()
  // Palette follows the site theme unless the caller passes one.
  const merged: ShaderParams = { ...defaultsFor(def!, theme), ...params } as ShaderParams
  const key = JSON.stringify(merged)
  const lastTheme = useRef(theme)
  const mountedAt = useRef(0)

  useEffect(() => {
    mountedAt.current = performance.now()
    if (!ref.current) return
    return getEngine().register(ref.current, { id: shader, params: merged }, dprCap)
    // register once; updates flow through the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Cross-fade on a real theme switch, not on the hydration catch-up right after load.
    const themeChanged = lastTheme.current !== theme && performance.now() - mountedAt.current > 800
    lastTheme.current = theme
    if (ref.current) getEngine().update(ref.current, { id: shader, params: merged }, themeChanged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shader, key])

  const p = merged.palette
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label ?? `${def?.name} shader background`}
      className={cx('block h-full w-full', className)}
      style={{
        background: `radial-gradient(60% 80% at 20% 30%, ${p[1]}, transparent 70%), radial-gradient(50% 70% at 80% 70%, ${p[2]}, transparent 70%), ${p[0]}`,
      }}
    />
  )
}

export function useMotionPaused() {
  return useSyncExternalStore(
    (fn) => getEngine().subscribe(fn),
    () => getEngine().paused,
    () => false,
  )
}
