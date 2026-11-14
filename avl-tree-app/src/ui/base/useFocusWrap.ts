import { useEffect, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * While `active`, Tab and Shift+Tab wrap inside `container` once focus is in it (quality bar 6, "Traps and
 * return"; ui-quality-sweep findings F-019, F-020). Focus on the opener is left alone, so the first Tab still
 * moves from the opener into the panel. Keys are handled on the document, as in ConfirmDialog.
 */
export function useFocusWrap(container: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      const box = container.current
      if (e.key !== 'Tab' || box === null || !box.contains(document.activeElement)) return
      const items = Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [container, active])
}
