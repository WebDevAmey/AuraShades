/** The one motion curve for the whole site: 300ms, strong ease-out. Mirrors --dur / --ease-out in styles.css. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const
export const DUR = 0.3
export const ease = { duration: DUR, ease: EASE_OUT }
