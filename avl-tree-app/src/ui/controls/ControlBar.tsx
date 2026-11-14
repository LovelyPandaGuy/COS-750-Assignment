// The control bar (tree-controls "The control bar", "The control bar is one tab stop"; design 1, D136, D137).
// A WAI-ARIA toolbar: one tab stop (the last button focused, else the first); Left and Right wrap, Home and End
// jump. Callers render ControlButtons; the bar sets tabIndex on the DOM after each render.
import './controls.css'
import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'

export interface ControlBarProps {
  label: string
  children: ReactNode
}

/** Roving tab stop: every button but one is out of the tab order. */
const OFF_TAB_STOP = -1

const MOVES: Record<string, (i: number, n: number) => number> = {
  ArrowRight: (i, n) => (i + 1) % n,
  ArrowLeft: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_, n) => n - 1,
}

export function ControlBar({ label, children }: ControlBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const current = useRef(0)
  const buttons = (): HTMLButtonElement[] => (ref.current === null ? [] : Array.from(ref.current.querySelectorAll<HTMLButtonElement>('button')))
  const roveTo = (i: number) => {
    const bs = buttons()
    current.current = Math.max(0, Math.min(i, bs.length - 1))
    bs.forEach((b, j) => {
      b.tabIndex = j === current.current ? 0 : OFF_TAB_STOP
    })
    return bs[current.current]
  }

  // Buttons come and go (Delete disappears): clamp the stop after every render.
  useLayoutEffect(() => {
    roveTo(current.current)
  })

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const move = MOVES[e.key]
    const bs = buttons()
    const i = bs.indexOf(e.target as HTMLButtonElement)
    if (move === undefined || i < 0 || bs.length === 0) return
    e.preventDefault()
    roveTo(move(i, bs.length))?.focus()
  }
  const onFocus = (e: { target: EventTarget }) => {
    const i = buttons().indexOf(e.target as HTMLButtonElement)
    if (i >= 0) roveTo(i)
  }

  return (
    <div ref={ref} role="toolbar" aria-label={label} aria-orientation="horizontal" className="control-bar" onKeyDown={onKeyDown} onFocus={onFocus}>
      {children}
    </div>
  )
}
