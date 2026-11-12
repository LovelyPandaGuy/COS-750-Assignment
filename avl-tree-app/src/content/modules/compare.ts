// Wording for the C8 drawings: the sorted array and the comparison table (add-module-c8-choosing).
// FLAGGED FOR THE USER TO READ: [beyond ID] all wording.
export const compareCopy = {
  probe: (n: number) => `probe ${n}`,
  table: {
    caption: 'Four structures compared',
    structure: 'Structure',
    searchTypical: 'Search, typical',
    searchWorst: 'Search, worst case',
    insertTypical: 'Insert, typical',
    insertWorst: 'Insert, worst case',
    inOrder: 'Keys in order',
    yes: 'yes',
    no: 'no',
  },
} as const
