// Sandbox limits (FR-VIS-08, wireframe 1n). One place, so a team vote changes one constant.
import type { Key } from '../engine/tree'

/** Most nodes the sandbox tree holds (FR-VIS-08). */
export const SANDBOX_MAX_NODES = 15
export const SANDBOX_KEY_MIN = 1
export const SANDBOX_KEY_MAX = 99
/** "Insert 1 to 7 in order": with rebalancing off these build a chain (wireframe 1n). */
export const SORTED_DEMO: readonly Key[] = [1, 2, 3, 4, 5, 6, 7]
