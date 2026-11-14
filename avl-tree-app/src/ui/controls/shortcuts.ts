// Every tree shortcut, defined once (tree-controls "One shortcut registry"; revamp-tree-controls design 3, D138).
// aria-keyshortcuts, the key handlers and KeyboardHelp all read this, so they cannot disagree.
import { controlsCopy } from '../../content/controls'

export type ShortcutScreen = 'editor' | 'replay' | 'sandbox'

export interface Shortcut {
  /** The aria-keyshortcuts value. */
  aria: string
  /** The key caps shown on a button and in the help. */
  caps: string
  action: string
  screens: readonly ShortcutScreen[]
  /** Keys a handler matches (KeyboardEvent.key, lower case for letters); `mod` needs Ctrl or Cmd. */
  match: readonly { key: string; mod?: boolean }[]
}

const a = controlsCopy.actions

export const SHORTCUTS = {
  treeMove: { aria: 'ArrowUp ArrowLeft ArrowRight', caps: '↑ ← →', action: a.treeMove, screens: ['editor'], match: [] },
  treeSelect: { aria: 'Enter', caps: 'Enter', action: a.treeSelect, screens: ['editor'], match: [] },
  barMove: { aria: 'ArrowLeft ArrowRight Home End', caps: '← → Home End', action: a.barMove, screens: ['editor'], match: [] },
  rotateRight: { aria: 'R', caps: 'R', action: a.rotateRight, screens: ['editor'], match: [{ key: 'r' }] },
  rotateLeft: { aria: 'L', caps: 'L', action: a.rotateLeft, screens: ['editor'], match: [{ key: 'l' }] },
  cancel: { aria: 'Escape', caps: 'Esc', action: a.cancel, screens: ['editor'], match: [{ key: 'escape' }] },
  undo: { aria: 'Control+Z Meta+Z', caps: 'Ctrl+Z', action: a.undo, screens: ['editor'], match: [{ key: 'z', mod: true }] },
  // Wireframe 1f: registered for the step-controls change; no screen uses them yet.
  stepPlay: { aria: 'Space', caps: 'Space', action: a.stepPlay, screens: ['replay'], match: [{ key: ' ' }] },
  stepBack: { aria: 'ArrowLeft', caps: '←', action: a.stepBack, screens: ['replay'], match: [{ key: 'arrowleft' }] },
  stepForward: { aria: 'ArrowRight', caps: '→', action: a.stepForward, screens: ['replay'], match: [{ key: 'arrowright' }] },
  stepSpeed: { aria: '[ ]', caps: '[ ]', action: a.stepSpeed, screens: ['replay'], match: [{ key: '[' }, { key: ']' }] },
} as const satisfies Record<string, Shortcut>

export type ShortcutId = keyof typeof SHORTCUTS

export function shortcutsFor(screen: ShortcutScreen): Shortcut[] {
  return Object.values(SHORTCUTS).filter((s: Shortcut) => s.screens.includes(screen))
}

/** Whether a key event is this shortcut. Letters ignore case; other modifiers than the one asked for are not allowed. */
export function matches(id: ShortcutId, e: { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean }): boolean {
  const key = e.key.toLowerCase()
  const mod = e.ctrlKey || e.metaKey
  return (SHORTCUTS[id] as Shortcut).match.some((m) => m.key === key && (m.mod === true ? mod && !e.altKey : !mod && !e.altKey))
}
