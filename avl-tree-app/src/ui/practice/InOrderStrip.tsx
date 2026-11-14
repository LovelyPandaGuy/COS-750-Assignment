import './practice.css'
import { lessonCopy } from '../../content/lesson'
import { inOrderKeys as inOrder } from '../../engine/shape'
import type { Tree } from '../../engine/tree'

const copy = lessonCopy.practice

export function InOrderStrip({ tree, formatKey = String }: { tree: Tree; formatKey?: (k: number) => string }) {
  return (
    <div className="practice-strip">
      <span>{copy.stripTitle}</span>
      <ol aria-label={copy.stripLabel}>
        {inOrder(tree).map((k) => (
          <li key={k}>{formatKey(k)}</li>
        ))}
      </ol>
      <span className="practice-strip-note">— {copy.stripNote}</span>
    </div>
  )
}
