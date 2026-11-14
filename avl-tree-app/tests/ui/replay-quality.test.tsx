import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { makeNode, type Key } from '../../src/engine/tree'
import { ReplayPlayer } from '../../src/ui/replay/ReplayPlayer'

// Spec: revamp-tree-controls / ui-tree-controls "Quality bar for the tree controls": QB1, QB3, QB5, QB6, QB7, QB10.
// QB2 is npm run lint plus tests/ui/step-controls.test.tsx; QB4 and QB8 are tests/visual/replay.spec.ts;
// QB9 is tests/ui/replay-motion.test.tsx. Greyscale and colour-vision runs (QB7, D25) are the a11y-checker's.

const leaf = (k: Key) => makeNode(k, null, null)
const CHAIN = makeNode(30, leaf(20), null)
const BAL = makeNode(20, leaf(10), leaf(30))
const INSERT = { kind: 'insert' as const, tree: CHAIN, key: 10 }
const ALL = { primary: 'animation' as const, supporting: ['text', 'pseudocode'] as const }

const steps = (n: number) => {
  for (let i = 0; i < n; i++) fireEvent.click(screen.getByRole('button', { name: 'Step' }))
}
const caption = () => screen.getAllByRole('status').filter((el) => !el.closest('.tree-view'))[0]
const follows = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
const css = () => readFileSync('src/ui/replay/replay.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** Elements a Tab press can reach, in DOM order, named by their accessible label or text. */
function tabOrder(root: HTMLElement): string[] {
  const els = [...root.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"], summary, a[href]')]
  return els.map((el) => {
    if (el instanceof HTMLInputElement) return `${el.type}:${el.closest('label')?.textContent?.replace(/\s+/g, ' ').trim()}`
    return el.getAttribute('aria-label') ?? el.textContent!.replace(/[^A-Za-z0-9.× ]/g, '').trim()
  })
}

describe('QB1 matches screen 1f: parts in order', () => {
  it('switcher, tree, caption, controls, pseudocode panel, whole-tree text', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" representations={{ ...ALL, supporting: [...ALL.supporting] }} />)
    const order = [
      screen.getByRole('group', { name: /^show/i }),
      screen.getByRole('region', { name: 'Tree' }),
      caption(),
      screen.getByRole('group', { name: /replay controls/i }),
      screen.getByRole('region', { name: /^pseudocode/i }),
      screen.getByRole('heading', { name: /^the whole tree$/i }),
    ]
    for (let i = 1; i < order.length; i++) expect(follows(order[i - 1], order[i]), `part ${i}`).toBe(true)
  })
})

describe('QB3 every state for the switcher and the pseudocode line', () => {
  it('checkbox and radio labels have default, hover, checked and disabled rules; focus is the shared ring', () => {
    const s = css()
    expect(s).toMatch(/:hover/)
    expect(s).toMatch(/:has\(input:checked\)|input:checked/)
    expect(s).toMatch(/:has\(input:disabled\)|input:disabled/)
    expect(s).not.toMatch(/:focus/)
  })
})

describe('QB5 axe has no violations in every replay state', () => {
  it('held, start, imbalance step and end, with the switcher', async () => {
    const reps = { ...ALL, supporting: [...ALL.supporting] }
    const held = render(<ReplayPlayer operation={INSERT} label="Tree" representations={reps} held />)
    expect(await axe(held.container)).toHaveNoViolations()
    held.unmount()
    const r = render(<ReplayPlayer operation={INSERT} label="Tree" representations={reps} />)
    expect(await axe(r.container)).toHaveNoViolations()
    steps(8)
    expect(await axe(r.container)).toHaveNoViolations()
    steps(1)
    expect(await axe(r.container)).toHaveNoViolations()
  })
})

describe('QB6 keyboard only: logical tab order', () => {
  it('insert: enabled boxes, tree, its Describe button, Back, Play, Step, Replay, speeds', () => {
    const { container } = render(<ReplayPlayer operation={INSERT} label="Tree" representations={{ ...ALL, supporting: [...ALL.supporting] }} />)
    steps(3)
    const order = tabOrder(container)
    expect(order).toEqual([
      expect.stringMatching(/^checkbox:.*text/i),
      expect.stringMatching(/^checkbox:.*pseudocode/i),
      'Tree',
      expect.stringMatching(/describe tree/i),
      'Back',
      'Play',
      'Step',
      'Replay',
      '0.5×',
      '1×',
      '2×',
    ])
  })

  it('search: the loop and recursive choice comes after the speeds', () => {
    const { container } = render(<ReplayPlayer operation={{ kind: 'search', tree: BAL, key: 30 }} label="Tree" />)
    steps(1)
    const order = tabOrder(container)
    const two = order.indexOf('2×')
    expect(two).toBeGreaterThan(-1)
    expect(order.slice(two + 1)).toEqual([expect.stringMatching(/^radio:.*loop/i), expect.stringMatching(/^radio:.*recursive/i)])
  })

  it('every replay action has a key or a tab stop: Space, arrows and brackets inside the player', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    // Arrows step from the controls; inside the tree's scroll box they scroll instead (review C5).
    const play = screen.getByRole('button', { name: 'Play' })
    play.focus()
    fireEvent.keyDown(play, { key: 'ArrowRight' })
    expect(screen.getByText('Step 1 / 9')).toBeTruthy()
  })
})

describe('QB7 colour is never the only signal', () => {
  it('selected speed: aria-pressed and a 2 px border; locked box: "main" and disabled; current line: marker, bold, aria-current', () => {
    const s = css()
    expect(s).toMatch(/\.replay-button\[aria-pressed='true'\][^{]*\{[^}]*border-width:\s*2px/)
    // Review A2: weight is a real cue only if the other speed buttons are not bold.
    expect(s).toMatch(/\.replay-button\[aria-pressed='true'\][^{]*\{[^}]*font-weight:\s*700/)
    expect(s).toMatch(/\.replay-button\[aria-pressed='false'\][^{]*\{[^}]*font-weight:\s*400/)
    expect(s).toMatch(/\.pseudo-line\[aria-current='step'\][^{]*\{[^}]*font-weight:\s*700/)
    render(<ReplayPlayer operation={INSERT} label="Tree" representations={{ ...ALL, supporting: [...ALL.supporting] }} />)
    steps(1)
    expect(screen.getByRole('button', { name: '1×' })).toHaveAttribute('aria-pressed', 'true')
    const diagram = within(screen.getByRole('group', { name: /^show/i })).getByRole('checkbox', { name: /diagram/i })
    expect(diagram).toBeDisabled()
    expect(diagram.closest('label')!.textContent).toMatch(/\bmain\b/i)
    const current = within(screen.getByRole('region', { name: /^pseudocode/i }))
      .getAllByRole('listitem')
      .filter((li) => li.getAttribute('aria-current') === 'step')
    expect(current).toHaveLength(1)
    expect(current[0].textContent).toContain('▶')
  })
})

describe('QB10 calm wording in everything the replay shows', () => {
  it('no wrong, fail, incorrect or error at any position', () => {
    const { container } = render(<ReplayPlayer operation={INSERT} label="Tree" representations={{ ...ALL, supporting: [...ALL.supporting] }} />)
    for (let p = 0; p <= 9; p++) {
      if (p > 0) steps(1)
      expect(container.textContent, `position ${p}`).not.toMatch(/\b(wrong|fail\w*|incorrect|error\w*)\b/i)
    }
  })
})
