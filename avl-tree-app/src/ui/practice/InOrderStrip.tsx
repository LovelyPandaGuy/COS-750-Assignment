import './practice.css'
import { practiceCopy } from '../../content/practice'
import { inOrder } from '../../practice/rotate'
import type { Tree } from '../../engine/tree'

const copy = practiceCopy.practice

export function InOrderStrip({ tree }: { tree: Tree }) {
  return (
    <div className="practice-strip">
      <span>{copy.stripTitle}</span>
      <ol aria-label={copy.stripLabel}>
        {inOrder(tree).map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ol>
      <span className="practice-strip-note">— {copy.stripNote}</span>
    </div>
  )
}
