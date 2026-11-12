// Which modules have content. A module missing here keeps its skeleton screens.
import { c2 } from '../content/modules/c2'
import { c3 } from '../content/modules/c3'
import type { ModuleId } from '../state/learnerState'
import type { ModuleContent } from './schema'

export const MODULE_CONTENT: Partial<Record<ModuleId, ModuleContent>> = { C2: c2, C3: c3 }
