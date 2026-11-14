import './practice.css'
import { lessonCopy } from '../../content/lesson'
import type { Direction } from '../../engine/rotations'
import type { Key } from '../../engine/tree'

const copy = lessonCopy.practice

export interface RotationMenuProps {
  node: Key
  onRotate: (dir: Direction) => void
  onCancel: () => void
}

/** Both directions stay enabled so a refusal can explain itself (FR-VIS-06). */
export function RotationMenu({ node, onRotate, onCancel }: RotationMenuProps) {
  return (
    <div role="group" aria-label={copy.menuName(String(node))} className="practice-menu">
      <button type="button" className="practice-button" onClick={() => onRotate('right')}>
        <span aria-hidden="true">{copy.iconRight}</span>
        {copy.rotateRight(String(node))}
      </button>
      <button type="button" className="practice-button" onClick={() => onRotate('left')}>
        <span aria-hidden="true">{copy.iconLeft}</span>
        {copy.rotateLeft(String(node))}
      </button>
      <button type="button" className="practice-button" onClick={onCancel}>
        {copy.cancel}
      </button>
    </div>
  )
}
