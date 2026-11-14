import { baseCopy } from '../../content/base'
import './base.css'
import type { ChipLevel } from './levels'

type Target =
  | { href?: undefined; onSelect?: undefined; disabled?: undefined }
  | { href: string; onSelect?: undefined; disabled?: undefined }
  | { href?: undefined; onSelect: () => void; disabled?: boolean }

export type OutcomeChipProps = {
  level: ChipLevel
  /** The outcome's text, from content. */
  text: string
} & Target

/** Outline glyphs on the 24 grid with a 2 px stroke: the level reads without colour (D25). */
const GLYPH: Record<ChipLevel, { name: string; shape: React.JSX.Element }> = {
  remember: { name: 'circle', shape: <circle cx="12" cy="12" r="8" /> },
  understand: { name: 'diamond', shape: <path d="M12 3 21 12 12 21 3 12Z" /> },
  apply: { name: 'triangle', shape: <path d="M12 4 21 20H3Z" /> },
}

/** A learning outcome with its Bloom level (add-ui-foundation). Static unless given an href or onSelect. */
export function OutcomeChip(props: OutcomeChipProps) {
  const { level, text } = props
  const glyph = GLYPH[level]
  const inner = (
    <>
      <span className="chip-level">
        <svg
          className="chip-glyph"
          data-glyph={glyph.name}
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          {glyph.shape}
        </svg>
        {baseCopy.bloom[level]}
      </span>
      <span className="chip-text">{text}</span>
    </>
  )
  const cls = `chip chip-${level}`
  if (props.href !== undefined) {
    return (
      <a className={`${cls} chip-interactive`} href={props.href}>
        {inner}
      </a>
    )
  }
  if (props.onSelect !== undefined) {
    return (
      <button type="button" className={`${cls} chip-interactive`} onClick={props.onSelect} disabled={props.disabled}>
        {inner}
      </button>
    )
  }
  return <span className={cls}>{inner}</span>
}
