import './practice.css'
import { controlsCopy } from '../../content/controls'
import { lessonCopy } from '../../content/lesson'
import type { Direction } from '../../engine/rotations'
import { ControlButton } from '../controls/ControlButton'

const copy = lessonCopy.practice
const icons = controlsCopy.icons

export interface RotationMenuProps {
  /** The selected node, as the question writes it. */
  node: string
  onRotate: (dir: Direction) => void
  onCancel: () => void
}

/**
 * Both directions stay enabled so a refusal can explain itself (FR-VIS-06). The buttons are tree controls
 * (revamp-tree-controls, D139); R, L and Esc come from the shortcut registry and are handled by the editor.
 */
export function RotationMenu({ node, onRotate, onCancel }: RotationMenuProps) {
  return (
    <div role="group" aria-label={copy.menuName(node)} className="practice-menu">
      <ControlButton icon={icons.rotateRight} label={copy.rotateRight(node)} shortcut="rotateRight" onClick={() => onRotate('right')} />
      <ControlButton icon={icons.rotateLeft} label={copy.rotateLeft(node)} shortcut="rotateLeft" onClick={() => onRotate('left')} />
      <ControlButton variant="quiet" label={copy.cancel} shortcut="cancel" onClick={onCancel} />
    </div>
  )
}
