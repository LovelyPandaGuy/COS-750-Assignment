import { useSyncExternalStore } from 'react'

/**
 * True while the window is at least `px` wide, as `@media (min-width: …px)` (D118). Pass a value from
 * BREAKPOINTS, never a number, so the widths stay in one place. False where there is no matchMedia.
 */
export function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`
  const list = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query) : null)
  return useSyncExternalStore(
    (onChange) => {
      const l = list()
      l?.addEventListener('change', onChange)
      return () => l?.removeEventListener('change', onChange)
    },
    () => list()?.matches ?? false,
    () => false,
  )
}
