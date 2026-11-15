// Shell wording. Flagged for the user to read: none of this comes from the ID content.
// The Settings button (was "Aa"; revamp-navigation, D157): the name starts with the visible word (WCAG 2.5.3).
export const shellCopy = {
  appTitle: 'AVL Trees · pre-lecture primer',
  skipLinkLabel: 'Skip to main content',
  aaButtonText: 'Settings',
  aaButtonName: 'Settings: display and read-aloud',
  // add-dark-mode-toggle: the switch's name. The on/off state is announced from aria-checked.
  darkTheme: 'Dark theme',
  switchOn: 'On',
  switchOff: 'Off',
  /** The Lessons sidebar on every screen (revamp-navigation, D155; ID 8.2 lesson list). Flagged for the user to read. */
  sidebar: {
    label: 'Lessons',
    menuButton: 'Lessons',
    menuPanel: 'Lessons, all lessons',
    words: { done: 'Done', current: 'You are here', open: 'Not started', locked: 'Not yet open' },
    symbols: { done: '✓', current: '▶', open: '○', locked: '·' },
    optional: 'Optional',
  },
} as const
