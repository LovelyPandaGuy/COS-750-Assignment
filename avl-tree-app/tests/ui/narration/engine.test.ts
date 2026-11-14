import { describe, expect, it } from 'vitest'
import { collectNarration } from '../../../src/ui/narration/collect'
import { MAX_UTTERANCE_CHARS, browserEngine, pickVoice, splitParts } from '../../../src/ui/narration/engine'
import { LOCAL_EN, LOCAL_FR, REMOTE_EN } from './fake'

// Spec: add-narration / narration "On-device voices only", "Reads the visible screen in reading order,
// words from the screen only". NFR-05, D146, D147; design decisions 1, 3 and 4.

describe('NFR-05 D147 on-device voices only', () => {
  it('prefers an on-device English voice over a remote one', () => {
    expect(pickVoice([REMOTE_EN, LOCAL_FR, LOCAL_EN])).toBe(LOCAL_EN)
  })
  it('falls back to any on-device voice', () => {
    expect(pickVoice([REMOTE_EN, LOCAL_FR])).toBe(LOCAL_FR)
  })
  it('only remote voices, or none: no voice', () => {
    expect(pickVoice([REMOTE_EN])).toBeNull()
    expect(pickVoice([])).toBeNull()
  })
  it('a browser without speech has no engine', () => {
    expect('speechSynthesis' in window).toBe(false)
    expect(browserEngine()).toBeNull()
  })
})

function dom(html: string) {
  const root = document.createElement('div')
  root.innerHTML = html
  document.body.append(root)
  return root
}

describe('D146 reading order from markers', () => {
  it('document order, normalised whitespace', () => {
    const root = dom(`<h2 data-narrate>Title</h2><button>Next</button><p data-narrate>One
      two</p><ul><li data-narrate>A</li><li data-narrate>B</li></ul>`)
    expect(collectNarration(root)).toEqual(['Title', 'One two', 'A', 'B'])
  })
  it('a marked part inside a marked part is read once', () => {
    const root = dom(`<div data-narrate><p data-narrate>Inner</p> outer</div>`)
    expect(collectNarration(root)).toEqual(['Inner outer'])
  })
  it('hidden and aria-hidden parts are skipped', () => {
    const root = dom(`<p data-narrate hidden>Hidden</p><div hidden><p data-narrate>In hidden</p></div><p data-narrate aria-hidden="true">Decor</p><p data-narrate>Shown</p>`)
    expect(collectNarration(root)).toEqual(['Shown'])
  })
  it('data-narrate-text wins over the text inside', () => {
    const root = dom(`<div data-narrate data-narrate-text="Described tree"><svg></svg><button>Describe</button></div>`)
    expect(collectNarration(root)).toEqual(['Described tree'])
  })
  it('empty parts are dropped', () => {
    const root = dom(`<p data-narrate>  </p><p data-narrate>Text</p>`)
    expect(collectNarration(root)).toEqual(['Text'])
  })
})

describe('design decision 4: long parts are split at sentence ends', () => {
  it('short text stays one part', () => {
    expect(splitParts(['One. Two.'])).toEqual(['One. Two.'])
  })
  it('long text is split into parts no longer than the limit, at sentence ends, keeping every word', () => {
    const sentence = 'This sentence is about forty characters. '
    const long = sentence.repeat(12).trim()
    const parts = splitParts([long])
    expect(parts.length).toBeGreaterThan(1)
    for (const p of parts) {
      expect(p.length).toBeLessThanOrEqual(MAX_UTTERANCE_CHARS)
      expect(p).toMatch(/\.$/)
    }
    expect(parts.join(' ')).toBe(long)
  })
  it('one sentence longer than the limit stays whole', () => {
    const one = 'word '.repeat(60).trim() + '.'
    expect(splitParts([one])).toEqual([one])
  })
})
