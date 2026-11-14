import './practice.css'
import { lessonCopy } from '../../content/lesson'
import { inOrderKeys as inOrder } from '../../engine/shape'
import type { Key, Tree } from '../../engine/tree'

const copy = lessonCopy.practice

export interface InOrderStripProps {
  tree: Tree
  formatKey?: (k: Key) => string
  /** The sequences before and after the last rotation, from the engine (ID 9.6, LO4). */
  rotation?: { before: readonly Key[]; after: readonly Key[] } | null
  /** A key just placed, marked with a word as well as a style. */
  newKey?: Key | null
}

const same = (a: readonly Key[], b: readonly Key[]) => a.length === b.length && a.every((k, i) => k === b[i])

export function InOrderStrip({ tree, formatKey = String, rotation = null, newKey = null }: InOrderStripProps) {
  if (rotation !== null) {
    return (
      <div className="practice-strip practice-strip-compare">
        {[
          [copy.stripBefore, rotation.before],
          [copy.stripAfter, rotation.after],
        ].map(([label, keys]) => (
          <div key={label as string} className="practice-strip-row">
            <span>{label as string}:</span>
            <ol aria-label={label as string}>
              {(keys as readonly Key[]).map((k) => (
                <li key={k}>{formatKey(k)}</li>
              ))}
            </ol>
          </div>
        ))}
        {same(rotation.before, rotation.after) && <p className="practice-strip-note">{copy.stripSame}</p>}
      </div>
    )
  }
  return (
    <div className="practice-strip">
      <span>{copy.stripTitle}</span>
      <ol aria-label={copy.stripLabel}>
        {inOrder(tree).map((k) => (
          <li key={k} data-new={k === newKey ? '' : undefined}>
            {formatKey(k)}
            {k === newKey && <span className="practice-strip-new"> {copy.stripNew}</span>}
          </li>
        ))}
      </ol>
      <span className="practice-strip-note">— {copy.stripNote}</span>
    </div>
  )
}
