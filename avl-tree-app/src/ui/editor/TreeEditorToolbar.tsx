// Wireframe 1m TreeEditorToolbar (tree-editor; revamp-tree-editor design 3, D132). Place holds the next key;
// none of the buttons is primary, so "Check answer" stays the one primary action (D41).
import { lessonCopy } from '../../content/lesson'
import type { Key } from '../../engine/tree'

const copy = lessonCopy.questions.builder

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
    <div role="toolbar" aria-label={copy.toolbarLabel} className="editor-toolbar">
      <button
        type="button"
        className="module-button module-button-secondary"
        aria-pressed={nextKey === null ? undefined : held}
        disabled={disabled || nextKey === null}
        onClick={onInsert}
      >
        {nextKey === null ? copy.placeNone : copy.place(formatKey(nextKey))}
      </button>
      {deleteKey !== null && (
        <button type="button" className="module-button module-button-secondary" disabled={disabled || !canDelete} onClick={onDelete}>
          {copy.remove(formatKey(deleteKey))}
        </button>
      )}
      <button type="button" className="module-button module-button-quiet" aria-keyshortcuts="Control+Z Meta+Z" disabled={disabled || !canUndo} onClick={onUndo}>
        {copy.undo}
      </button>
      <button type="button" className="module-button module-button-quiet" disabled={disabled || !canUndo} onClick={onReset}>
        {copy.reset}
      </button>
    </div>
  )
}
