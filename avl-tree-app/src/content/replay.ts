// Replay wording (FR-VIS-03, FR-VIS-07, FR-VIS-11). Flagged for the user to read:
// none of this comes from the ID content. Sentence style follows wireframe 1f note 4.
// Numbers are passed in from the engine's trace; nothing here computes an answer.
// Case names and the balance range come from the conventions wording (D19), read at call time.
// revamp-tree-controls adds the switcher, Replay, group, caption and whole-tree labels (flagged, beyond the ID).
import type { RebalanceCase } from '../engine/conventions'
import { conventionsWording } from './modules/conventionsWording'

const w = () => conventionsWording()

type Dir = 'left' | 'right'

export const replayCopy = {
  /** One step at 1×, in ms. Assumed (proposal question 4); not in the ID or SE document. */
  baseMs: 1200,
  controls: {
    label: 'Replay controls',
    back: 'Back',
    play: 'Play',
    pause: 'Pause',
    step: 'Step',
    replay: 'Replay',
    iconReplay: '↺',
    navGroup: 'Replay navigation',
    progressGroup: 'Progress and speed',
    iconBack: '⏮',
    iconPlay: '▶',
    iconPause: '⏸',
    iconStep: '⏭',
    speed: 'Speed',
    speedLabel: (s: number) => `${s}×`,
    progress: 'Replay progress',
    counter: (p: number, n: number) => `Step ${p} / ${n}`,
    held: 'Make your prediction, or skip it, to start the replay.',
    help: 'Keys: Space play or pause, ← and → step, [ and ] speed.',
  },
  visited: (n: number) => `Nodes visited: ${n}`,
  explanationLabel: 'Step explanation',
  /** Heading of the Text representation: the whole tree in words (D105). */
  wholeTree: 'The whole tree',
  /** The representation switcher (D106): choices, never learning styles. Read aloud waits for change 24 (D26). */
  switcher: {
    show: 'Show',
    mode: 'Mode',
    watch: 'Watch',
    doIt: 'Do it yourself',
    main: 'main',
    diagram: 'Diagram',
    text: 'Text',
    pseudocode: 'Pseudocode',
  },
  panel: {
    title: (name: string) => `Pseudocode: ${name}`,
    insert: 'AVL insert',
    searchLoop: 'search (loop)',
    searchRecursive: 'search (recursive)',
    formLegend: 'Search form',
    loop: 'Loop',
    recursive: 'Recursive',
    marker: '▶',
    caseLabel: (c: RebalanceCase) => `Case ${w().caseName(c)}`,
  },
  sentence: {
    startInsert: (k: number) => `Inserting ${k}. Press Play or Step to watch.`,
    startSearch: (k: number) => `Searching for ${k}. Press Play or Step to watch.`,
    compareEqual: (k: number, at: number) => `Compare ${k} with ${at}: they are equal.`,
    compare: (k: number, at: number, dir: Dir) =>
      `Compare ${k} with ${at}: ${k} is ${dir === 'left' ? 'smaller' : 'larger'}, so go ${dir}.`,
    descend: (from: number, to: number, dir: Dir) => `Move ${dir} from ${from} to ${to}.`,
    descendNoneInsert: (k: number, at: number, dir: Dir) => `${at} has no ${dir} child, so ${k} goes there.`,
    descendNoneSearch: (at: number, dir: Dir) => `${at} has no ${dir} child, so the search stops here.`,
    found: (k: number) => `${k} was found at this node.`,
    duplicate: (k: number) => `${k} is already in the tree, so nothing changes.`,
    notFound: (k: number) => `${k} is not in the tree.`,
    insert: (k: number) => `Add ${k} as a new leaf.`,
    height: (at: number, h: number, bf: string) =>
      `Walking back up: node ${at} now has height ${h} and balance factor ${bf}.`,
    imbalance: (z: number, bf: string, y: number, c: RebalanceCase) =>
      `Node ${z} has balance factor ${bf}, outside ${w().rangeText}, so it is the lowest unbalanced node. Its taller child is ${y}, so this is case ${w().caseName(c)}.`,
    rotation: (at: number, pivot: number, dir: Dir, c: RebalanceCase) =>
      `Case ${w().caseName(c)}: rotate ${dir} at ${at}, lifting ${pivot} up.`,
  },
} as const
