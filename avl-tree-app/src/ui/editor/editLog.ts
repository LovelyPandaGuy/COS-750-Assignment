// The edit log's sentences (tree-editor "The edit log"; revamp-tree-editor design 6, D134). Built from the
// builder's step log, so undo and reset rewind it for free. No verdict: a sentence only says what was done.
import { lessonCopy } from '../../content/lesson'
import type { Key } from '../../engine/tree'
import type { BuilderStep } from '../../live/mark'

const copy = lessonCopy.questions.builder

export function editLogEntries(log: readonly BuilderStep[], formatKey: (k: Key) => string): string[] {
  return log.map((step) => {
    switch (step.type) {
      case 'place':
        return step.parent === null || step.side === null ? copy.placedRoot(formatKey(step.key)) : copy.placedChild(formatKey(step.key), step.side, formatKey(step.parent))
      case 'rotate':
        return copy.rotated(step.dir, formatKey(step.about))
      case 'delete':
        return copy.deleted(formatKey(step.key))
    }
  })
}
