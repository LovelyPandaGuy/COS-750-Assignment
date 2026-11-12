// Tree view wording. Flagged for the user to read: none of this comes from the ID content.
// Sentence style follows wireframe 1f note 4; "balance factor" is written in full for screen-reader users.
export const treeViewCopy = {
  unbalancedFlag: 'Unbalanced',
  unbalancedWord: 'unbalanced',
  balancedWord: 'balanced',
  roleTag: { new: 'new', z: 'z', y: 'y' },
  emptyTree: 'The tree is empty.',
  describeButton: 'Describe tree',
  sideWord: { left: 'Left', right: 'Right' },
  selected: (key: number) => `Node ${key} selected`,
  /** The "h2 · bf +1" annotation drawn beside each node. */
  metrics: (height: number, bf: string) => `h${height} · bf ${bf}`,
  rootSentence: (key: number, details: string) => `Root ${key} (${details}).`,
  childSentence: (side: string, key: number, parentKey: number, details: string) =>
    `${side} child ${key} of ${parentKey} (${details}).`,
  details: (height: number, bf: string, extras: string[]) =>
    [`height ${height}`, `balance factor ${bf}`, ...extras].join(', '),
  nodeName: (key: number, height: number, bf: string, extras: string[]) =>
    [`Node ${key}`, `height ${height}`, `balance factor ${bf}`, ...extras].join(', '),
  // Hidden-balance mode for practice (add-modules-c2-c3): the height stays, the balance factor does not.
  metricsHidden: (height: number) => `h${height} · bf ?`,
  detailsHidden: (height: number, extras: string[]) => [`height ${height}`, 'balance factor hidden', ...extras].join(', '),
  nodeNameHidden: (key: number, height: number, extras: string[]) =>
    [`Node ${key}`, `height ${height}`, 'balance factor hidden', ...extras].join(', '),
} as const
