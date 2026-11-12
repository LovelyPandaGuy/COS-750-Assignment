// The only content file that says which subtree comes first in the balance factor, which way a
// sign leans, and what the allowed range and the height convention are (D2, D19). It never types a
// side or a number: every one comes from src/engine/conventions.ts, so a lecturer answer on D2 is a
// one-module change.
// FLAGGED FOR THE USER TO READ: the sentence wording is new (not in the ID); the facts are the ID's.
import {
  BALANCE_FACTOR_ORDER,
  BALANCE_RANGE,
  EMPTY_HEIGHT,
  LEAF_HEIGHT,
  leanOf,
  type Side,
} from '../../engine/conventions'

export interface ConventionsWording {
  /** "balance factor = height of the left subtree − height of the right subtree" */
  formula: string
  /** One sentence saying which side is taller for a balance factor of this sign. */
  leanPhrase: (balanceFactor: number) => string
  /** "−1, 0 or +1" */
  rangeText: string
  /** "A leaf has height 0 and an empty tree has height −1." */
  heightRule: string
  sideWord: (side: Side) => string
  /** A number as the app displays it: +2, 0, −1. */
  num: (n: number) => string
}

const SIDE_WORD: Record<Side, string> = { left: 'left', right: 'right' }

function num(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0'
}

/** Plain count, no plus sign: 0, −1. */
function count(n: number): string {
  return n < 0 ? `−${-n}` : String(n)
}

export function conventionsWording(order: readonly [Side, Side] = BALANCE_FACTOR_ORDER): ConventionsWording {
  const [first, second] = order
  const range = BALANCE_RANGE.map(num)
  return {
    formula: `balance factor = height of the ${SIDE_WORD[first]} subtree − height of the ${SIDE_WORD[second]} subtree`,
    leanPhrase: (bf) => {
      const side: Side = leanOf(bf) === 'left-heavy' ? 'left' : 'right'
      return `A balance factor of ${num(bf)} means the ${SIDE_WORD[side]} subtree is taller.`
    },
    rangeText: `${range.slice(0, -1).join(', ')} or ${range[range.length - 1]}`,
    heightRule: `A leaf has height ${count(LEAF_HEIGHT)} and an empty tree has height ${count(EMPTY_HEIGHT)}.`,
    sideWord: (side) => SIDE_WORD[side],
    num,
  }
}
