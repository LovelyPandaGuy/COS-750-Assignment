// Tree view wording. Flagged for the user to read: none of this comes from the ID content.
// Sentence style follows wireframe 1f note 4; "balance factor" is written in full for screen-reader users.
export const treeViewCopy = {
  unbalancedFlag: 'Unbalanced',
  unbalancedWord: 'unbalanced',
  balancedWord: 'balanced',
  /** Visible tags (ID 11.1 "NEW" tag; conventions.unbalancedNode "n"). Being rotated has none: the caption says it. */
  roleTag: { new: 'NEW', n: 'n' } as Record<string, string>,
  /** Words for assistive technology, one per role. */
  roleWord: { new: 'newly inserted', rotating: 'being rotated', n: 'n, the first unbalanced node' },
  unbalancedMarker: '!',
  emptyTree: 'The tree is empty.',
  describeButton: 'Describe tree',
  sideWord: { left: 'Left', right: 'Right' },
  selected: (key: string) => `Node ${key} selected`,
  /** The "h2 · bf +1" annotation drawn beside each node; either part can be left out (the screen's show list). */
  metrics: (height: number | null, bf: string | null) => [height === null ? null : `h${height}`, bf === null ? null : `bf ${bf}`].filter((x) => x !== null).join(' · '),
  rootSentence: (key: string, details: string) => `Root ${key} (${details}).`,
  childSentence: (side: string, key: string, parentKey: string, details: string) =>
    `${side} child ${key} of ${parentKey} (${details}).`,
  details: (height: number, bf: string, extras: string[]) =>
    [`height ${height}`, `balance factor ${bf}`, ...extras].join(', '),
  nodeName: (key: string, height: number, bf: string, extras: string[]) =>
    [`Node ${key}`, `height ${height}`, `balance factor ${bf}`, ...extras].join(', '),
  // Hidden-balance mode for practice (add-modules-c2-c3): the height stays, the balance factor does not.
  metricsHidden: (height: number) => `h${height} · bf ?`,
  detailsHidden: (height: number, extras: string[]) => [`height ${height}`, 'balance factor hidden', ...extras].join(', '),
  nodeNameHidden: (key: string, height: number, extras: string[]) =>
    [`Node ${key}`, `height ${height}`, 'balance factor hidden', ...extras].join(', '),
} as const
