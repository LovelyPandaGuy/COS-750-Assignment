import type { Key } from '../../engine/tree'
import { compareCopy as copy } from '../../content/modules/compare'

export interface ArrayViewProps {
  /** The keys in the order the array holds them (sorted). */
  keys: readonly Key[]
  /** The key at each binary search probe, in order. */
  probes: readonly Key[]
  /** Accessible name of the drawing. */
  label: string
}

/**
 * A sorted array as a row of cells (add-module-c8-choosing). Each probed cell has a dashed outline
 * and its probe number in text, so the marker is never colour alone. The row scrolls sideways at
 * narrow widths instead of shrinking (D17).
 */
export function ArrayView({ keys, probes, label }: ArrayViewProps) {
  const probeOf = new Map(probes.map((k, i) => [k, i + 1]))
  return (
    <div className="array-scroll" role="region" aria-label={label} tabIndex={0}>
      <ol className="array-cells">
        {keys.map((k) => {
          const n = probeOf.get(k)
          return (
            <li key={k} className="array-cell" data-key={k} data-probe={n ?? undefined}>
              <span className="array-key">{k}</span>
              {n !== undefined && <span className="array-probe">{copy.probe(n)}</span>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
