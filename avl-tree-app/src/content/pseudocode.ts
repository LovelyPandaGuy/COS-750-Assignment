// Pseudocode listings for the pseudocode panel (FR-VIS-04). Flagged for the user to read.
// Generic pseudocode (D12; ask the lecturer whether Java or Python is wanted).
// Line k of each listing is the line the engine means by `pseudocodeLine` k:
// - searchLoop and searchRecursive follow the layout in src/engine/search.ts
//   (LOOP_LINES, RECURSIVE_LINES). The ID's PDF text lost its line breaks, so
//   the layout is an assumption (add-search-trace proposal).
// - insert is the five-step outline of ID C6 / SE 6.4 that INSERT_LINES points
//   at. The ID has no line-level insert pseudocode (add-replay-and-pseudocode
//   proposal, question 2). Line 4 never lights on its own: the imbalance step
//   carries the case and the panel names it beside line 3.
// Case names (LL, RR, LR, RL) are never written here; the panel shows the
// case from the step itself.
export const pseudocode = {
  insert: [
    'insert k as in a plain BST, remembering the path',
    'walk back up the path, updating each height',
    'stop at the lowest unbalanced node z (bf +2 or −2)',
    'work out the case from z and its taller child y',
    'rotate to fix z; nothing above needs fixing',
  ],
  searchLoop: [
    'search(root, k):',
    '  v = root',
    '  while v != null:',
    '    if k == v.key: return v',
    '    else if k < v.key: v = v.left',
    '    else: v = v.right',
    '  return null',
  ],
  searchRecursive: [
    'search(v, k):',
    '  if v == null: return null',
    '  if k == v.key: return v',
    '  if k < v.key: return search(v.left, k)',
    '  return search(v.right, k)',
  ],
} as const satisfies Record<string, readonly string[]>
