// Predict-first and Do-it-yourself wording. FLAGGED FOR THE USER TO READ: none of this comes from the ID content
// (it follows wireframes 1g and 1h). Low-anxiety rules: wrong answers are information, so no red and no
// judging words; every state starts with a word or an icon as well as any colour.
// Numbers and names are filled in by the components from engine results; no answer is typed here.

export const practiceCopy = {
  // ---- Predict first (wireframe 1g) ----
  predict: {
    heading: 'Before you watch: predict',
    question: {
      node: (key: number) => `We're about to insert ${key}. Which node will be the first to become unbalanced?`,
      case: (key: number) => `We're about to insert ${key}. Which of the four cases will apply?`,
      root: (key: number) => `We're about to insert ${key}. Which node will be at the top of the rotated subtree?`,
    },
    treeHint: 'Click a node in the tree, or pick here:',
    treeLabel: 'Tree before the insert',
    groupLabel: 'Your prediction',
    node: (key: number) => `Node ${key}`,
    none: 'None — it stays balanced',
    yourPick: (key: number) => `Your pick: Node ${key}`,
    lockIn: 'Lock in & watch',
    skip: 'Skip, just watch',
    lockedIn: (what: string) => `Prediction locked in: ${what}.`,
    skipped: 'Skipped. Watch the replay.',
    note: 'Predictions are practice. They never count toward anything.',
  },

  // ---- Reveal (wireframe 1g, note 2) ----
  reveal: {
    matchIcon: '✓',
    differIcon: '◌',
    differ: 'Not quite yet.',
    node: (key: number) => `node ${key}`,
    none: 'none',
    atStep: (n: number) => `step ${n}`,
    match: (what: string, step: string | null) =>
      step === null
        ? `Matches. You predicted ${what}, and every node stays between −1 and +1.`
        : `Matches. You predicted ${what}, and ${step} shows it.`,
    inRange: (predicted: number, predictedBf: string, step: string, z: number, zBf: string) =>
      `You predicted node ${predicted}. At ${step}, node ${predicted} shows balance factor ${predictedBf}, which is allowed. Node ${z} shows ${zBf}, so it is the first one out of balance.`,
    alsoHigher: (predicted: number, predictedBf: string, step: string, z: number) =>
      `You predicted node ${predicted}. At ${step}, node ${predicted} shows ${predictedBf} as well, but node ${z} is lower on the path, so node ${z} is the first one out of balance.`,
    noneButUnbalanced: (step: string, z: number, zBf: string) =>
      `You predicted none. This insert does unbalance a node: at ${step}, node ${z} shows balance factor ${zBf}.`,
    noneExpectedNode: (predicted: number, predictedBf: string) =>
      `You predicted node ${predicted}. Every node stays between −1 and +1 here, and node ${predicted} shows ${predictedBf}.`,
    noneExpectedOther: (what: string) =>
      `You predicted ${what}. Every node stays between −1 and +1 here, so no rotation is needed.`,
    caseMismatch: (predicted: string, z: number, zSide: string, y: number, ySide: string, actual: string) =>
      `You predicted ${predicted}. Node ${z} (z) leans ${zSide} and its taller child, node ${y}, leans ${ySide}, so the case is ${actual}.`,
    rootMismatch: (predicted: number, actual: number) =>
      `You predicted node ${predicted}. After rebalancing, node ${actual} is lifted to the top of that subtree.`,
    left: 'left',
    right: 'right',
    replayStep: 'Replay that step',
  },

  // ---- Do it yourself (wireframe 1h) ----
  mode: { legend: 'Mode', watch: 'Watch', doIt: 'Do it yourself' },
  practice: {
    label: 'Do it yourself',
    heading: 'Your turn',
    task: (rotations: 1 | 2) =>
      `Rebalance the tree with ${rotations === 1 ? 'one rotation' : 'two rotations'}. Select the node to rotate at, then choose the direction.`,
    noRotation: 'This example needs no rotation, so there is nothing to practise here.',
    treeLabel: 'Practice tree',
    menuName: (key: number) => `Rotate at node ${key}`,
    rotateRight: (key: number) => `Rotate right at ${key} (R)`,
    rotateLeft: (key: number) => `Rotate left at ${key} (L)`,
    cancel: 'Cancel (Esc)',
    undo: 'Undo (Ctrl+Z)',
    reset: 'Reset',
    iconRight: '↻',
    iconLeft: '↺',
    iconUndo: '↶',
    stripLabel: 'In-order sequence',
    stripTitle: 'In-order:',
    stripNote: 'stays identical after any rotation',
    help: 'Tab into the tree · arrow keys move between nodes (↑ parent, ← → children) · Enter selects · R / L rotate · Esc cancels · Ctrl+Z undoes',
    feedbackLabel: 'Feedback',
    updatesLabel: 'Updates',
    undone: 'Rotation undone.',
    resetDone: 'Practice reset to the start.',
  },
  feedback: {
    balancedIcon: '✓',
    flippedIcon: '⇄',
    unbalancedIcon: '◌',
    refusedIcon: 'ⓘ',
    balanced: 'Balanced. Every node is now between −1 and +1. The in-order sequence did not change.',
    flipped: (node: number, bf: string) =>
      `Not quite yet. The subtree now leans the other way: node ${node} has balance factor ${bf}. This attempt is not counted. Undo and try a different rotation.`,
    unbalanced: (node: number, bf: string) =>
      `Not quite yet. Node ${node} still has balance factor ${bf}. This attempt is not counted. If this was the first of two rotations, carry on; otherwise Undo and try again.`,
    refused: (node: number, side: 'left' | 'right') =>
      `Node ${node} has no ${side} child to lift, so that rotation does nothing. The tree is unchanged.`,
    noNode: (node: number) => `Node ${node} is not in the tree. The tree is unchanged.`,
  },
} as const
