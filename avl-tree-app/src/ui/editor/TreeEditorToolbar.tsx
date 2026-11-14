// Wireframe 1m TreeEditorToolbar (tree-editor "Undo, reset and delete"; D132, D136). Rendered as the shared
// control bar (tree-controls): Place, Delete, Undo, Reset, in that order, below the tree. None is primary, so
// "Check answer" stays the one primary action (D41).
import { controlsCopy } from '../../content/controls'
import { lessonCopy } from '../../content/lesson'
import type { Key } from '../../engine/tree'
import { ControlBar } from '../controls/ControlBar'
import { ControlButton } from '../controls/ControlButton'

const copy = lessonCopy.questions.builder
const icons = controlsCopy.icons

export interface TreeEditorToolbarOwnProps {
  /** The next key to place, or null when every key is placed. */
  nextKey: Key | null
  /** Hold the next key, or let go of it when held. */
  onInsert: () => void
  held: boolean
  canUndo: boolean
  onUndo: () => void
  onReset: () => void
  /** The key a delete question removes, while it can still be removed. */
  deleteKey: Key | null
  canDelete: boolean
  onDelete: () => void
  formatKey: (k: Key) => string
  disabled: boolean
}

export function TreeEditorToolbar({ nextKey, onInsert, held, canUndo, onUndo, onReset, deleteKey, canDelete, onDelete, formatKey, disabled }: TreeEditorToolbarOwnProps) {
  return (
    <ControlBar label={copy.toolbarLabel}>
      <ControlButton
        icon={icons.place}
        label={nextKey === null ? copy.placeNone : copy.place(formatKey(nextKey))}
        pressed={nextKey === null ? undefined : held}
        disabled={disabled || nextKey === null}
        onClick={onInsert}
      />
      {deleteKey !== null && <ControlButton icon={icons.remove} label={copy.remove(formatKey(deleteKey))} disabled={disabled || !canDelete} onClick={onDelete} />}
      <ControlButton variant="quiet" icon={icons.undo} label={copy.undo} shortcut="undo" disabled={disabled || !canUndo} onClick={onUndo} />
      <ControlButton variant="quiet" icon={icons.reset} label={copy.reset} disabled={disabled || !canUndo} onClick={onReset} />
    </ControlBar>
  )
}
