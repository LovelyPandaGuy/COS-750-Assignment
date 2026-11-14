import type { Representation } from '../../modules/schema'

/** The boxes the representation switcher offers, in order (D106). Read aloud joins in change 24 (D26). */
export const SWITCHER_BOXES = ['diagram', 'text', 'pseudocode'] as const satisfies readonly Representation[]
export type SwitcherBox = (typeof SWITCHER_BOXES)[number]

/** Which box a primary representation locks on: `animation` plays on the diagram, so it locks Diagram. */
export function lockedBox(primary: Representation): SwitcherBox {
  return primary === 'animation' ? 'diagram' : primary
}
