import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { axe } from 'vitest-axe'
import { avlInsert } from '../../src/engine/avl'
import { makeNode, type Key, type Tree } from '../../src/engine/tree'
import { traceFor, explainAt, treeAt, rolesAt, visitedAt, type Operation } from '../../src/replay/replay'
import { describeTree } from '../../src/ui/tree/describe'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { sentenceFor } from '../../src/ui/replay/sentence'
import { ReplayPlayer } from '../../src/ui/replay/ReplayPlayer'
import { ModeSwitch } from '../../src/ui/practice/ModeSwitch'

// Spec: add-replay-and-pseudocode / step-replay and pseudocode-panel.
// Requirement IDs: FR-VIS-03, FR-VIS-04, FR-VIS-05, FR-VIS-07, FR-VIS-10, FR-VIS-11, NFR-02. Outcomes: LO5, LO7.
// revamp-tree-controls / ui-tree-controls "Caption under the tree", "Replay control strip", "Step timing",
// "Text representation", and the modified step-replay requirements (reading order, caption is the live region).
// D22, D23, D29, D104, D105; FR-LRN-02.

afterEach(() => vi.useRealTimers())

const leaf = (k: Key) => makeNode(k, null, null)
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const CHAIN = makeNode(30, leaf(20), null)
const BAL = makeNode(20, leaf(10), leaf(30))
const INSERT: Operation = { kind: 'insert', tree: CHAIN, key: 10 }

const btn = (name: string | RegExp) => screen.getByRole('button', { name })
/** The caption: the one role=status element outside the tree view (D105). */
const live = () => {
  const found = screen.getAllByRole('status').filter((el) => !el.closest('.tree-view'))
  expect(found, 'exactly one caption status region').toHaveLength(1)
  return found[0]
}
const treeRegion = () => screen.getByRole('region', { name: 'Tree' })
const wholeTree = () => screen.queryByRole('heading', { name: /^the whole tree$/i })
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
    for (let p = 1; p < seen.length; p++) expect(seen[p]).not.toBe(seen[p - 1])
  })

  it('the imbalance sentence names 30, +2, 20 and LL', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(8)
    const t = live().textContent!
    expect(t).toMatch(/\b30\b/)
    expect(t).toMatch(/\+2/)
    expect(t).toMatch(/\b20\b/)
    expect(t).toContain(conventionsWording().caseName('LL'))
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
  it('z and y tags are drawn at the imbalance step', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(8)
    const region = screen.getByRole('region', { name: 'Tree' })
    expect(region.querySelector('[data-role="z"]')?.getAttribute('data-key')).toBe('30')
    expect(region.querySelector('[data-role="y"]')?.getAttribute('data-key')).toBe('20')
    expect(region.querySelector('[data-role="new"]')?.getAttribute('data-key')).toBe('10')
  })
})

describe('FR-VIS-11 search replays with a step count', () => {
  it('found: 4 steps, count 2, sentence says found', () => {
    render(<ReplayPlayer operation={{ kind: 'search', tree: BAL, key: 30 }} label="Tree" />)
    expect(counter()).toBe('Step 0 / 4')
    stepTimes(4)
    expect(screen.getByText(/nodes visited: 2/i)).toBeTruthy()
    expect(live().textContent).toMatch(/30 was found/i)
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
    expect(within(panel).getAllByRole('listitem')).toHaveLength(5)
    expect(counter()).toBe('Step 0 / 4')
    fireEvent.click(btn('Step'))
    const items = within(panel).getAllByRole('listitem')
    expect(items.findIndex((li) => li.getAttribute('aria-current') === 'step') + 1).toBe(3)
  })

  it('insert has no form choice', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    expect(screen.queryByRole('radio')).toBeNull()
  })
})

describe('NFR-02 pseudocode panel is readable by assistive technology', () => {
  it('a named region with an ordered list of 5 and visible line numbers', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    const panel = screen.getByRole('region', { name: /pseudocode: avl insert/i })
    const list = within(panel).getByRole('list')
    expect(list.tagName).toBe('OL')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(5)
    items.forEach((li, i) => expect(li.textContent).toContain(String(i + 1)))
    expect(panel.querySelectorAll('[tabindex]')).toHaveLength(0)
  })

  it('listing uses the mono token, the highlight token and bold for the current line', () => {
    const css = readFileSync('src/ui/replay/replay.css', 'utf8')
    expect(css).toMatch(/\.pseudo-list[^{]*\{[^}]*font:\s*var\(--type-mono\)/)
    // D104: inverted, from existing tokens (was the pale --code-highlight fill).
    expect(css).toMatch(/\.pseudo-line\[aria-current[^{]*\{[^}]*background:\s*var\(--text-primary\)/)
    expect(css).toMatch(/\.pseudo-line\[aria-current[^{]*\{[^}]*font-weight:\s*700/)
    expect(css).toMatch(/\.pseudo-line\[aria-current[^{]*\{[^}]*color:\s*var\(--bg-surface\)/)
  })

  it('long lines wrap', () => {
    const css = readFileSync('src/ui/replay/replay.css', 'utf8')
    expect(css).toMatch(/\.pseudo-line[^{]*\{[^}]*(white-space:\s*pre-wrap|overflow-wrap:\s*anywhere)/)
  })
})

describe('FR-VIS-10 player layout and the Watch slot', () => {
  it('reading order: tree, caption, controls, pseudocode, whole-tree text', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    const order = [
      treeRegion(),
      live(),
      screen.getByRole('group', { name: /replay controls/i }),
      screen.getByRole('region', { name: /^pseudocode/i }),
      wholeTree()!,
    ]
    for (let i = 1; i < order.length; i++) {
      expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  it('controls wrap so 360 px needs no sideways page scroll', () => {
    const css = readFileSync('src/ui/replay/replay.css', 'utf8')
    expect(css).toMatch(/\.replay-controls[^{]*\{[^}]*flex-wrap:\s*wrap/)
  })

  it('in the Watch slot, with no axe violations', async () => {
    const { container } = render(<ModeSwitch watch={<ReplayPlayer operation={INSERT} label="Tree" />} base={CHAIN} keyToInsert={10} />)
    expect(screen.getByRole('radio', { name: 'Watch' })).toBeChecked()
    expect(btn('Play')).toBeTruthy()
    expect(await axe(container)).toHaveNoViolations()
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

// ---- revamp-tree-controls ----

const follows = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

describe('FR-VIS-07 D23 caption under the tree', () => {
  it('the caption comes after the tree and before the controls, and names 30, +2 and 20 at position 8', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(8)
    const cap = live()
    expect(follows(treeRegion(), cap)).toBe(true)
    expect(follows(cap, screen.getByRole('group', { name: /replay controls/i }))).toBe(true)
    // Directly under the tree: the tree view's next sibling is the caption (or holds it).
    const next = treeRegion().closest('.tree-view')!.nextElementSibling!
    expect(next === cap || next.contains(cap), 'caption directly after the tree view').toBe(true)
    const t = cap.textContent!
    expect(t).toMatch(/\b30\b/)
    expect(t).toMatch(/\+2/)
    expect(t).toMatch(/\b20\b/)
  })

  it('D23 the caption is the only live region with text; the tree view region stays empty', () => {
    const { container } = render(<ReplayPlayer operation={INSERT} label="Tree" />)
    const check = () => {
      const cap = live()
      expect(cap).toHaveAttribute('aria-live', 'polite')
      const others = [...container.querySelectorAll('[aria-live]')].filter((el) => el !== cap && !cap.contains(el))
      for (const o of others) expect(o.textContent!.trim(), 'a second live region has text').toBe('')
    }
    check()
    stepTimes(1)
    check()
    stepTimes(7)
    check()
  })

  it('FR-VIS-11 the visited count is in the caption', () => {
    const op: Operation = { kind: 'search', tree: BAL, key: 30 }
    render(<ReplayPlayer operation={op} label="Tree" />)
    stepTimes(3)
    const { trace } = traceFor(op, 'loop')
    expect(live().textContent).toContain(`Nodes visited: ${visitedAt(trace, 3)}`)
  })

  it('the caption uses the body type and the reading-column width (stylesheet)', () => {
    const css = readFileSync('src/ui/replay/replay.css', 'utf8')
    expect(css).toMatch(/\.replay-caption[^{]*\{[^}]*font:\s*var\(--type-body\)/)
    // Tokens only (quality bar 2): the 66ch reading width is the --reading-column token in tokens.css.
    expect(css).toMatch(/\.replay-caption[^{]*\{[^}]*max-width:\s*var\(--reading-column\)/)
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    expect(live()).toHaveClass('replay-caption')
  })
})

describe('FR-VIS-03 Replay restarts the replay', () => {
  it('from position 5, paused: Replay goes to 0 and plays one step per 1200 ms', () => {
    vi.useFakeTimers()
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(5)
    fireEvent.click(btn('Replay'))
    expect(counter()).toBe('Step 0 / 9')
    expect(btn('Pause')).toBeTruthy()
    advance(1200)
    expect(counter()).toBe('Step 1 / 9')
  })

  it('disabled at 0 while paused and while held', () => {
    const { rerender } = render(<ReplayPlayer operation={INSERT} label="Tree" />)
    expect(btn('Replay')).toBeDisabled()
    stepTimes(2)
    expect(btn('Replay')).toBeEnabled()
    rerender(<ReplayPlayer operation={{ ...INSERT, key: 25 }} label="Tree" held />)
    expect(btn('Replay')).toBeDisabled()
  })
})

describe('D29 step timing: speed ends', () => {
  it('[ at 0.5× stays at 0.5×; ] three times reaches 2× and stays', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    fireEvent.click(btn('0.5×'))
    const step = btn('Step')
    fireEvent.keyDown(step, { key: '[' })
    expect(btn('0.5×')).toHaveAttribute('aria-pressed', 'true')
    for (let i = 0; i < 3; i++) fireEvent.keyDown(step, { key: ']' })
    expect(btn('2×')).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('FR-VIS-07 D105 text representation: the whole tree', () => {
  it('a visible paragraph under "The whole tree" holds describeTree at the current position, not live', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(8)
    const h = wholeTree()
    expect(h).not.toBeNull()
    const { trace } = traceFor(INSERT, 'loop')
    const expected = describeTree(treeAt(CHAIN, trace, 8), rolesAt(trace, 8))
    const section = h!.closest('section, div')!
    expect(section.textContent).toContain(expected)
    expect(section.closest('details')).toBeNull()
    expect(section.closest('[aria-live]')).toBeNull()
    expect(section.querySelector('[aria-live]')).toBeNull()
    // The tree view's own Describe button is unchanged.
    expect(within(treeRegion().closest('.tree-view') as HTMLElement).getByRole('button', { name: /describe tree/i })).toBeTruthy()
  })
})

// ---- review fixes C4 and C5 (decided 14 Nov 2026) ----

describe('WCAG 2.4.3 review C4: focus is never lost in the strip', () => {
  it('Back at the start: focus moves to Play', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(1)
    const back = btn('Back')
    back.focus()
    fireEvent.click(back)
    expect(counter()).toBe('Step 0 / 9')
    expect(back).toBeDisabled()
    expect(document.activeElement).toBe(btn('Play'))
  })

  it('Step at the end: focus moves to Replay', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(8)
    const step = btn('Step')
    step.focus()
    fireEvent.click(step)
    expect(counter()).toBe('Step 9 / 9')
    expect(step).toBeDisabled()
    expect(document.activeElement).toBe(btn('Replay'))
  })

  it('playback reaching the end: focus moves from Step to Replay', () => {
    vi.useFakeTimers()
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    stepTimes(7)
    const step = btn('Step')
    step.focus()
    fireEvent.keyDown(step, { key: ' ' })
    advance(1200 * 2)
    expect(counter()).toBe('Step 9 / 9')
    expect(step).toBeDisabled()
    expect(document.activeElement).toBe(btn('Replay'))
  })

  it('focus outside the replay is left alone', () => {
    render(
      <>
        <button type="button">Outside</button>
        <ReplayPlayer operation={INSERT} label="Tree" />
      </>,
    )
    stepTimes(1)
    const outside = btn('Outside')
    outside.focus()
    fireEvent.click(btn('Back'))
    expect(btn('Back')).toBeDisabled()
    expect(document.activeElement).toBe(outside)
  })
})

describe('FR-VIS-03 review C5: arrows scroll the tree box instead of stepping', () => {
  it('inside the tree scroll box, arrows do not step and are not prevented; Space still plays', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    const box = treeRegion()
    expect(box).toHaveClass('tree-scroll')
    box.focus()
    expect(fireEvent.keyDown(box, { key: 'ArrowRight' }), 'ArrowRight not prevented').toBe(true)
    expect(fireEvent.keyDown(box, { key: 'ArrowLeft' }), 'ArrowLeft not prevented').toBe(true)
    expect(counter()).toBe('Step 0 / 9')
    fireEvent.keyDown(box, { key: ' ' })
    expect(btn('Pause')).toBeTruthy()
  })

  it('on the controls, arrows still step', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    const play = btn('Play')
    expect(fireEvent.keyDown(play, { key: 'ArrowRight' })).toBe(false)
    expect(counter()).toBe('Step 1 / 9')
  })
})
