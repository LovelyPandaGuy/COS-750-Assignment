// Slot wording for the tree editor (D132): one place for the names a slot is announced by.
import { lessonCopy } from '../../content/lesson'
import type { Key } from '../../engine/tree'
import type { Target } from '../lesson/questions/builder'

const copy = lessonCopy.questions.builder

export const SLOT_WORD = copy.slotWord

export const slotName = (t: Target, formatKey: (k: Key) => string) => (t.parent === null || t.side === null ? copy.slotRoot : copy.slot(t.side, formatKey(t.parent)))
