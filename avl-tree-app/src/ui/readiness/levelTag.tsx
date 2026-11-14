import { CHIP_LEVELS, OutcomeChip, type ChipLevel } from '../base'
import type { LevelTag } from './types'

const isChipLevel = (level: string): level is ChipLevel => (CHIP_LEVELS as readonly string[]).includes(level)

/**
 * A Bloom level tag (design decision 2). A level the design styles is the OutcomeChip (glyph and word);
 * any other (evaluate, analyse) is a plain outlined tag with its given word until the design adds it.
 */
export function levelTag({ level, word }: LevelTag) {
  if (isChipLevel(level)) {
    return (
      <span key={level} className="readiness-level-chip" data-level={level}>
        <OutcomeChip level={level} text="" />
      </span>
    )
  }
  return (
    <span key={level} className="readiness-level" data-level={level}>
      {word}
    </span>
  )
}
