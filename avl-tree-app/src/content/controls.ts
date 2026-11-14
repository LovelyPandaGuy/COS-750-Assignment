// Tree controls wording (revamp-tree-controls; D138, D139). Flagged for the user to read: none of this comes
// from the ID content. Keys follow wireframes 1f, 1h and 1m; icons are never a cross glyph (ID 10.1).
export const controlsCopy = {
  help: {
    heading: 'Keyboard shortcuts',
    show: 'Show keyboard shortcuts',
  },
  /** One action sentence per shortcut in src/ui/controls/shortcuts.ts. */
  actions: {
    treeMove: 'Move between nodes (up: parent; left and right: children)',
    treeSelect: 'Select a node',
    barMove: 'Move between buttons',
    rotateRight: 'Rotate right at the selected node',
    rotateLeft: 'Rotate left at the selected node',
    cancel: 'Let go of the key or close the menu',
    undo: 'Undo the last edit',
    stepPlay: 'Play or pause',
    stepBack: 'Step back',
    stepForward: 'Step forward',
    stepSpeed: 'Slower or faster',
  },
  icons: {
    place: '＋',
    remove: '−',
    undo: '↶',
    reset: '⟲',
    rotateRight: '↻',
    rotateLeft: '↺',
  },
} as const
