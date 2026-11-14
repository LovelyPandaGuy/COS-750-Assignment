// Empty-branch slots for a held key (tree-editor "Slots are targets…"; revamp-tree-editor design 2, D132).
// Drawn in TreeView's control layer (its `layer` prop), not inside role="tree". One roving tab stop; arrows move in in-order order.
import { useRef, useState, type KeyboardEvent } from 'react'
import type { Key } from '../../engine/tree'
import { NODE_DIAMETER } from '../tree/layout'
import type { Target } from '../lesson/questions/builder'
import { SLOT_WORD, slotName } from './slots'

/** At least a 44 px touch target (D3). */
const HIT = Math.max(44, NODE_DIAMETER)
const RING_R = 14
/** Roving tab stop: every slot but one is out of the tab order. */
const OFF_TAB_STOP = -1

export interface PlacedSlot extends Target {
  x: number
  y: number
}

export function SlotOverlay({ slots, formatKey, onPlace }: { slots: readonly PlacedSlot[]; formatKey: (k: Key) => string; onPlace: (t: Target) => void }) {
  const [focus, setFocus] = useState(0)
  const refs = useRef<(SVGGElement | null)[]>([])
  const at = Math.min(focus, slots.length - 1)
  const move = (i: number) => {
    const next = Math.max(0, Math.min(slots.length - 1, i))
    setFocus(next)
    refs.current[next]?.focus()
  }
  const onKeyDown = (i: number) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      move(i + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(i - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onPlace(slots[i])
    }
  }
  return (
    <g className="editor-slots">
      {slots.map((t, i) => (
        <g
          key={`${t.parent}:${t.side}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="editor-slot"
          role="button"
          aria-label={slotName(t, formatKey)}
          tabIndex={i === at ? 0 : OFF_TAB_STOP}
          transform={`translate(${t.x} ${t.y})`}
          onClick={() => onPlace(t)}
          onKeyDown={onKeyDown(i)}
          onFocus={() => setFocus(i)}
        >
          <rect className="editor-slot-hit" x={-HIT / 2} y={-HIT / 2} width={HIT} height={HIT} rx={8} />
          <circle className="editor-slot-ring" r={RING_R} />
          <text className="editor-slot-word" y={RING_R + 14} aria-hidden="true">
            {SLOT_WORD}
          </text>
        </g>
      ))}
    </g>
  )
}
