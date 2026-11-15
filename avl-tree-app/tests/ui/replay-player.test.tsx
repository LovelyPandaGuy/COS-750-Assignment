import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { axe } from 'vitest-axe'
import { avlInsert } from '../../src/engine/avl'
import { makeNode, type Key, type Tree } from '../../src/engine/tree'
import { traceFor, explainAt, type Operation } from '../../src/replay/replay'
import { sentenceFor } from '../../src/ui/replay/sentence'
import { ReplayPlayer } from '../../src/ui/replay/ReplayPlayer'

// Spec: add-replay-and-pseudocode / step-replay and pseudocode-panel.
// Requirement IDs: FR-VIS-03, FR-VIS-04, FR-VIS-05, FR-VIS-07, FR-VIS-10, FR-VIS-11, NFR-02. Outcomes: LO5, LO7.

afterEach(() => vi.useRealTimers())

const leaf = (k: Key) => makeNode(k, null, null)
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const CHAIN = makeNode(30, leaf(20), null)
const BAL = makeNode(20, leaf(10), leaf(30))
const INSERT: Operation = { kind: 'insert', tree: CHAIN, key: 10 }

const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const live = () => screen.getByRole('status', { name: /step explanation/i })
const counter = () => screen.getByText(/^Step \d+ \/ \d+$/).textContent
const stepTimes = (n: number) => {
  for (let i = 0; i < n; i++) fireEvent.click(btn('Step'))
}
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('FR-VIS-03 play, pause and speed', () => {
  it('plays one step per 1200 ms at 1x and stops at the end', () => {
    vi.useFakeTimers()
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    fireEvent.click(btn('Play'))
    advance(1199)
    expect(counter()).toBe('Step 0 / 9')
    advance(1)
    expect(counter()).toBe('Step 1 / 9')
    expect(btn('Pause')).toBeTruthy()
    advance(9600)
    expect(counter()).toBe('Step 9 / 9')
    expect(btn('Play')).toBeTruthy()
  })

  it('2x takes 600 ms a step and 0.5x takes 2400 ms', () => {
    vi.useFakeTimers()
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    fireEvent.click(btn('2×'))
    fireEvent.click(btn('Play'))
    advance(599)
    expect(counter()).toBe('Step 0 / 9')
    advance(1)
    expect(counter()).toBe('Step 1 / 9')
    fireEvent.click(btn('0.5×'))
    advance(2399)
    expect(counter()).toBe('Step 1 / 9')
    advance(1)
    expect(counter()).toBe('Step 2 / 9')
  })

  it('pause holds the position', () => {
    vi.useFakeTimers()
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    fireEvent.click(btn('Play'))
    advance(3600)
    fireEvent.click(btn('Pause'))
    advance(10000)
    expect(counter()).toBe('Step 3 / 9')
  })

  it('Play at the end starts again from 0', () => {
    vi.useFakeTimers()
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(9)
    fireEvent.click(btn('Play'))
    expect(counter()).toBe('Step 0 / 9')
    expect(btn('Pause')).toBeTruthy()
  })

  it('Step and Back move one position and Back restores the drawing', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(5)
    const at5 = screen.getByRole('region', { name: 'Tree' }).innerHTML
    fireEvent.click(btn('Step'))
    fireEvent.click(btn('Back'))
    expect(counter()).toBe('Step 5 / 9')
    expect(screen.getByRole('region', { name: 'Tree' }).innerHTML).toBe(at5)
  })
})

describe('FR-VIS-03 controls work by keyboard', () => {
  it('arrows step, brackets change speed, Space toggles once per press', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    const step = btn('Step')
    step.focus()
    fireEvent.keyDown(step, { key: 'ArrowRight' })
    fireEvent.keyDown(step, { key: 'ArrowRight' })
    fireEvent.keyDown(step, { key: 'ArrowLeft' })
    fireEvent.keyDown(step, { key: ']' })
    expect(counter()).toBe('Step 1 / 9')
    expect(btn('2×')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(step, { key: '[' })
    expect(btn('1×')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(step, { key: ' ' })
    expect(btn('Pause')).toBeTruthy()
    fireEvent.keyDown(step, { key: ' ' })
    expect(btn('Play')).toBeTruthy()
  })

  it('keys do nothing outside the player or with a modifier', () => {
    render(
      <>
        <button type="button">Outside</button>
        <ReplayPlayer operation={INSERT} label="Tree" />
      </>,
    )
    const outside = btn('Outside')
    fireEvent.keyDown(outside, { key: 'ArrowRight' })
    fireEvent.keyDown(outside, { key: ' ' })
    expect(counter()).toBe('Step 0 / 9')
    expect(btn('Play')).toBeTruthy()
    fireEvent.keyDown(btn('Step'), { key: 'ArrowRight', ctrlKey: true })
    fireEvent.keyDown(btn('Step'), { key: 'ArrowRight', altKey: true })
    fireEvent.keyDown(btn('Step'), { key: 'ArrowRight', metaKey: true })
    expect(counter()).toBe('Step 0 / 9')
  })
})

describe('FR-VIS-07 a sentence for each step', () => {
  it('live region is polite and updates on every step', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    expect(live()).toHaveAttribute('aria-live', 'polite')
    const seen = [live().textContent]
    for (let p = 1; p <= 9; p++) {
      fireEvent.click(btn('Step'))
      seen.push(live().textContent)
    }
    for (const s of seen) expect(s!.trim().length).toBeGreaterThan(0)
    expect(seen[0]).toMatch(/10/)
    // Sentences are the conventions captions: a comparison and the move it causes share one (step-replay).
    expect(seen.slice(1)).toEqual([
      '10 is smaller than 30, so the search goes left.',
      '10 is smaller than 30, so the search goes left.',
      '10 is smaller than 20, so the search goes left.',
      '10 is smaller than 20, so the search goes left.',
      '10 goes into the empty left branch of 20.',
      'Node 20 now has a balance factor of −1 − 0 = −1.',
      'Node 30 now has a balance factor of −1 − 1 = −2.',
      'Node 30 has a balance factor of −2, so it is the first unbalanced node, n. This is Case 1 (LL).',
      'Rotate 20 around 30. This is a right rotation about 30.',
    ])
  })

  it('the imbalance sentence is the conventions caption (ID 7.3)', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(8)
    expect(live().textContent).toBe('Node 30 has a balance factor of −2, so it is the first unbalanced node, n. This is Case 1 (LL).')
  })

  it('every sentence is non-empty and names the snapshot balance factor', () => {
    const ops: Operation[] = [
      INSERT,
      { kind: 'insert', tree: makeNode(30, leaf(10), null), key: 20 },
      { kind: 'insert', tree: BAL, key: 30 },
      { kind: 'insert', tree: null, key: 5 },
      { kind: 'insert', tree: avl([40, 20, 60, 10, 30, 50, 70]), key: 5 },
      { kind: 'search', tree: BAL, key: 30 },
      { kind: 'search', tree: BAL, key: 25 },
      { kind: 'search', tree: null, key: 25 },
    ]
    for (const op of ops) {
      const { trace } = traceFor(op, 'loop')
      for (let p = 0; p <= trace.length; p++) {
        const e = explainAt(op, trace, p)
        const s = sentenceFor(op, e)
        expect(s.trim().length, `${op.kind} ${op.key} @${p}`).toBeGreaterThan(0)
        if (e.balanceFactor !== undefined) {
          const n = e.balanceFactor
          expect(s).toContain(n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')
        }
        expect(s).not.toMatch(/wrong|fail|error|incorrect/i)
      }
    }
  })

  it('content wording has no red, error or fail words', () => {
    expect(readFileSync('src/content/replay.ts', 'utf8')).not.toMatch(/\b(wrong|fail\w*|error\w*|incorrect)\b/i)
  })
})

describe('FR-VIS-02 roles during the replay', () => {
  it('ID 11.1: the n tag and the NEW tag are drawn at the imbalance step', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(8)
    const region = screen.getByRole('region', { name: 'Tree' })
    expect(region.querySelector('[data-role="n"]')?.getAttribute('data-key')).toBe('30')
    expect(region.querySelector('[data-role="n"] .tree-tag')?.textContent).toBe('n')
    expect(region.querySelector('[data-role="new"]')?.getAttribute('data-key')).toBe('10')
  })
})

describe('FR-VIS-11 search replays with a step count', () => {
  it('found: 4 steps, count 2, sentence says found', () => {
    render(<ReplayPlayer operation={{ kind: 'search', tree: BAL, key: 30 }} label="Tree" />)
    expect(counter()).toBe('Step 0 / 4')
    stepTimes(4)
    expect(screen.getByText(/nodes visited: 2/i)).toBeTruthy()
    expect(live().textContent).toBe('30 equals 30, so the key is found.')
  })

  it('not found: 5 steps, count 2, sentence says not in the tree', () => {
    render(<ReplayPlayer operation={{ kind: 'search', tree: BAL, key: 25 }} label="Tree" />)
    expect(counter()).toBe('Step 0 / 5')
    stepTimes(5)
    expect(screen.getByText(/nodes visited: 2/i)).toBeTruthy()
    expect(live().textContent).toMatch(/25 is not in the tree/i)
  })

  it('insert shows no count', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    expect(screen.queryByText(/nodes visited/i)).toBeNull()
  })
})

describe('FR-VIS-05 replay waits for a prediction and can jump to a step', () => {
  it('held then released', () => {
    const { rerender } = render(<ReplayPlayer operation={INSERT} label="Tree" held />)
    expect(btn('Play')).toBeDisabled()
    expect(btn('Step')).toBeDisabled()
    fireEvent.keyDown(btn('Back'), { key: 'ArrowRight' })
    expect(counter()).toBe('Step 0 / 9')
    rerender(<ReplayPlayer operation={INSERT} label="Tree" held={false} />)
    expect(btn('Play')).toBeEnabled()
    expect(btn('Step')).toBeEnabled()
  })

  it('Replay that step: index 7 shows position 8, paused, and again after moving away', () => {
    const { rerender } = render(<ReplayPlayer operation={INSERT} label="Tree" />)
    rerender(<ReplayPlayer operation={INSERT} label="Tree" showStep={{ index: 7, nonce: 1 }} />)
    expect(counter()).toBe('Step 8 / 9')
    expect(btn('Play')).toBeTruthy()
    fireEvent.click(btn('Back'))
    rerender(<ReplayPlayer operation={INSERT} label="Tree" showStep={{ index: 7, nonce: 2 }} />)
    expect(counter()).toBe('Step 8 / 9')
  })

  it('a new key resets to 0, paused', () => {
    const { rerender } = render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(5)
    rerender(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 25 }} label="Tree" />)
    expect(counter()).toMatch(/^Step 0 \//)
    expect(btn('Play')).toBeTruthy()
  })

  it('the same operation values in a new object do not reset', () => {
    const { rerender } = render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(3)
    rerender(<ReplayPlayer operation={{ ...INSERT }} label="Tree" />)
    expect(counter()).toBe('Step 3 / 9')
  })
})

describe('FR-VIS-04 loop or recursive search', () => {
  it('switching form shows the recursive listing and restarts', () => {
    render(<ReplayPlayer operation={{ kind: 'search', tree: BAL, key: 30 }} label="Tree" />)
    const loop = screen.getByRole('radio', { name: /loop/i })
    expect(loop).toBeChecked()
    stepTimes(3)
    fireEvent.click(screen.getByRole('radio', { name: /recursive/i }))
    const panel = screen.getByRole('region', { name: /^pseudocode/i })
    expect(within(panel).getAllByRole('listitem')).toHaveLength(9)
    expect(counter()).toBe('Step 0 / 4')
    fireEvent.click(btn('Step'))
    const items = within(panel).getAllByRole('listitem')
    expect(items.findIndex((li) => li.getAttribute('aria-current') === 'step') + 1).toBe(4)
  })

  it('insert has no form choice', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    expect(screen.queryByRole('radio')).toBeNull()
  })
})

describe('NFR-02 pseudocode panel is readable by assistive technology', () => {
  it('a named region with an ordered list of 9 and visible line numbers', () => {
    render(<ReplayPlayer operation={{ kind: 'search', tree: BAL, key: 30 }} label="Tree" />)
    const panel = screen.getByRole('region', { name: /^pseudocode/i })
    const list = within(panel).getByRole('list')
    expect(list.tagName).toBe('OL')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(9)
    items.forEach((li, i) => expect(li.textContent).toContain(String(i + 1)))
    expect(panel.querySelectorAll('[tabindex]')).toHaveLength(0)
  })

  it('listing uses the mono token, the highlight token and bold for the current line', () => {
    const css = readFileSync('src/ui/replay/replay.css', 'utf8')
    expect(css).toMatch(/\.pseudo-list[^{]*\{[^}]*font:\s*var\(--type-mono\)/)
    expect(css).toMatch(/\.pseudo-line\[aria-current[^{]*\{[^}]*background:\s*var\(--code-highlight\)/)
    expect(css).toMatch(/\.pseudo-line\[aria-current[^{]*\{[^}]*font-weight:\s*700/)
    expect(css).toMatch(/\.pseudo-line\[aria-current[^{]*\{[^}]*color:\s*var\(--text-primary\)/)
  })

  it('long lines wrap', () => {
    const css = readFileSync('src/ui/replay/replay.css', 'utf8')
    expect(css).toMatch(/\.pseudo-line[^{]*\{[^}]*(white-space:\s*pre-wrap|overflow-wrap:\s*anywhere)/)
  })
})

describe('FR-VIS-10 player layout and the Watch slot', () => {
  it('reading order: tree, controls, pseudocode, sentence', () => {
    render(<ReplayPlayer operation={{ kind: 'search', tree: BAL, key: 30 }} label="Tree" />)
    const order = [
      screen.getByRole('region', { name: 'Tree' }),
      screen.getByRole('group', { name: /replay controls/i }),
      screen.getByRole('region', { name: /^pseudocode/i }),
      live(),
    ]
    for (let i = 1; i < order.length; i++) {
      expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  it('controls wrap so 360 px needs no sideways page scroll', () => {
    const css = readFileSync('src/ui/replay/replay.css', 'utf8')
    expect(css).toMatch(/\.replay-controls[^{]*\{[^}]*flex-wrap:\s*wrap/)
  })

  it('insert and search players have no axe violations mid-replay', async () => {
    const a = render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(8)
    expect(await axe(a.container)).toHaveNoViolations()
    a.unmount()
    const b = render(<ReplayPlayer operation={{ kind: 'search', tree: BAL, key: 25 }} label="Tree" />)
    stepTimes(3)
    expect(await axe(b.container)).toHaveNoViolations()
  })
})

// Spec: align-sandbox-explanations / step-replay "Sandbox operations" (D163, ID 7.2 C6 and C7).
describe('step-replay: sandbox operations (D163)', () => {
  const toEnd = () => {
    const step = () => screen.getByRole('button', { name: /^step/i })
    while (!step().hasAttribute('disabled')) fireEvent.click(step())
  }
  const keysIn = (c: HTMLElement) => [...c.querySelectorAll('[data-key]')].map((g) => Number(g.getAttribute('data-key'))).sort((a, b) => a - b)

  it('plain insert of 7 into 6: ends at 6(·, 7), no rotation', () => {
    const op: Operation = { kind: 'insert', tree: leaf(6), key: 7, rebalance: false }
    const { container } = render(<ReplayPlayer operation={op} label="Tree" />)
    toEnd()
    expect(keysIn(container)).toEqual([6, 7])
    expect(traceFor(op, 'loop').trace.some((s) => s.kind === 'rotation')).toBe(false)
  })

  it('leaf deletion with rebalancing: ends at 40(20(·, 30), 50), one left rotation about 20, no pseudocode', () => {
    const op: Operation = { kind: 'delete', tree: avl([20, 10, 40, 30, 50]), key: 10 }
    const { container } = render(<ReplayPlayer operation={op} label="Tree" />)
    expect(live()).toHaveTextContent('10')
    toEnd()
    expect(keysIn(container)).toEqual([20, 30, 40, 50])
    const rotations = traceFor(op, 'loop').trace.filter((s) => s.kind === 'rotation')
    expect(rotations.map((s) => s.nodes)).toEqual([[20, 40]])
    expect(screen.queryByRole('region', { name: /^pseudocode/i })).toBeNull()
  })

  it('plain leaf deletion: no rotation', () => {
    const op: Operation = { kind: 'delete', tree: avl([20, 10, 40, 30, 50]), key: 10, rebalance: false }
    expect(traceFor(op, 'loop').trace.some((s) => s.kind === 'rotation')).toBe(false)
  })
})

describe('step controls icons are drawn by the app font (screenshot, 15 Nov)', () => {
  it('no media symbols from U+23E9 to U+23FA, which the font lacks (they showed as empty boxes)', async () => {
    const { replayCopy } = await import('../../src/content/replay')
    const c = replayCopy.controls as unknown as Record<string, unknown>
    for (const k of ['iconBack', 'iconPlay', 'iconPause', 'iconStep']) expect(String(c[k]), k).not.toMatch(/[\u23E9-\u23FA]/)
  })
})
