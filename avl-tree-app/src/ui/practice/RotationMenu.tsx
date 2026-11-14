import './practice.css'
import { lessonCopy } from '../../content/lesson'
import type { Direction } from '../../engine/rotations'

const copy = lessonCopy.practice

export interface RotationMenuProps {
  /** The selected node, as the question writes it. */
  node: string
  onRotate: (dir: Direction) => void
  onCancel: () => void
}

/** Both directions stay enabled so a refusal can explain itself (FR-VIS-06). R, L and Esc are handled by the editor (D133). */
export function RotationMenu({ node, onRotate, onCancel }: RotationMenuProps) {
  return (
    <div role="group" aria-label={copy.menuName(node)} className="practice-menu">
      <button type="button" className="practice-button" aria-keyshortcuts="R" onClick={() => onRotate('right')}>
        <span aria-hidden="true">{copy.iconRight}</span>
        {copy.rotateRight(node)}
        <kbd aria-hidden="true">{copy.keyRight}</kbd>
      </button>
      <button type="button" className="practice-button" aria-keyshortcuts="L" onClick={() => onRotate('left')}>
        <span aria-hidden="true">{copy.iconLeft}</span>
        {copy.rotateLeft(node)}
        <kbd aria-hidden="true">{copy.keyLeft}</kbd>
      </button>
      <button type="button" className="practice-button" aria-keyshortcuts="Escape" onClick={onCancel}>
        {copy.cancel}
        <kbd aria-hidden="true">{copy.keyCancel}</kbd>
      </button>
    </div>
  )
}
