import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { replayCopy } from '../../src/content/replay'

// Spec: revamp-tree-controls / ui-tree-controls "Case and range wording come from the conventions" (source scan)
// and "Quality bar for the tree controls" QB10 (calm wording). D19, D2, D27; screen 1f conflicts.

const src = (p: string) => readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const FILES = ['src/content/replay.ts', 'src/content/pseudocode.ts']

describe('D19 replay content types no case, range, signed value or formula', () => {
  it.each(FILES.map((f) => [f]))('%s', (f) => {
    const s = src(f)
    expect(s, 'case code').not.toMatch(/\b(LL|RR|LR|RL)\b/)
    expect(s, 'typed range').not.toMatch(/[−-]1 to \+1/)
    expect(s, 'typed range list').not.toMatch(/[−-]1, 0 or \+1/)
    expect(s, 'signed out-of-range value').not.toMatch(/\+2|[−]2\b/)
    expect(s, 'formula').not.toMatch(/height\(|h\(node\.left\)|h\(L\)/)
  })

  it('the replay copy and the insert listing read the conventions wording', () => {
    expect(src('src/content/replay.ts')).toMatch(/conventionsWording/)
    expect(src('src/content/pseudocode.ts')).toMatch(/conventionsWording|BALANCE_RANGE/)
  })
})

describe('QB10 D27 calm, consistent replay wording', () => {
  it('no wrong, fail, incorrect or error in replay content', () => {
    expect(src('src/content/replay.ts')).not.toMatch(/\b(wrong|fail\w*|incorrect|error\w*)\b/i)
  })

  it('the keys help uses the same words as the buttons', () => {
    const c = replayCopy.controls
    const help = c.help.toLowerCase()
    for (const w of [c.play, c.pause, c.step, c.speed]) expect(help, w).toContain(w.toLowerCase())
  })

  it('the strip has a Replay label, a navigation group and a progress group, all distinct', () => {
    const c = replayCopy.controls as Record<string, unknown>
    expect(c.replay).toBe('Replay')
    expect(typeof c.navGroup).toBe('string')
    expect(typeof c.progressGroup).toBe('string')
    expect(c.navGroup).not.toBe(c.progressGroup)
  })

  it('replay styles use no feedback token (the replay gives no verdicts)', () => {
    expect(src('src/ui/replay/replay.css')).not.toMatch(/var\(--feedback-/)
  })
})
