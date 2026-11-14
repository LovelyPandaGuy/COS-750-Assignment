import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import fc from 'fast-check'
import { avlInsert } from '../../src/engine/avl'
import { LOOP_LINES, RECURSIVE_LINES, type SearchForm } from '../../src/engine/search'
import { makeNode, type Key, type Tree } from '../../src/engine/tree'
import { pseudocode } from '../../src/content/pseudocode'
import { traceFor, type Operation } from '../../src/replay/replay'
import { ReplayPlayer } from '../../src/ui/replay/ReplayPlayer'

// Spec: pseudocode-panel (add-live-lesson-content delta). FR-VIS-04, ID 7.4: the two search listings come
// from conventions.json and there is no insert listing.

afterEach(cleanup)

const leaf = (k: Key) => makeNode(k, null, null)
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const CHAIN = makeNode(30, leaf(20), null)

const panel = () => screen.getByRole('region', { name: /^pseudocode/i })
const lines = () => within(panel()).getAllByRole('listitem')
const current = () => lines().filter((li) => li.getAttribute('aria-current') === 'step')
const currentLine = () => {
  const c = current()
  return c.length === 0 ? null : lines().indexOf(c[0]) + 1
}
const step = () => fireEvent.click(screen.getByRole('button', { name: /^step$/i }))

describe('FR-VIS-04 ID 7.4 listings match the engine line numbers', () => {
  it('has the two nine-line ID listings and no insert listing', () => {
    expect(pseudocode.searchLoop).toHaveLength(9)
    expect(pseudocode.searchRecursive).toHaveLength(9)
    expect('insert' in pseudocode).toBe(false)
  })

  it('every engine line exists in its listing', () => {
    const fits = (map: Record<string, number>, listing: readonly string[]) =>
      Object.values(map).forEach((n) => expect(n >= 1 && n <= listing.length, `line ${n}`).toBe(true))
    fits(LOOP_LINES, pseudocode.searchLoop)
    fits(RECURSIVE_LINES, pseudocode.searchRecursive)
  })

  it('line purposes', () => {
    const loop = pseudocode.searchLoop
    expect(loop[3]).toMatch(/if element in node p equals el/)
    expect(loop[6]).toMatch(/p = p\.left/)
    expect(loop[7]).toMatch(/else p = p\.right/)
    expect(loop[8]).toMatch(/return null/)
    const rec = pseudocode.searchRecursive
    expect(rec[1]).toMatch(/if root is null/)
    expect(rec[3]).toMatch(/else if element in root equals el/)
  })
})

describe('FR-VIS-04 current line is highlighted', () => {
  it('search example: lines per position', () => {
    const T = avl([10, 20, 30, 40, 50])
    render(<ReplayPlayer operation={{ kind: 'search', tree: T, key: 35 }} label="Tree" />)
    const seen: (number | null)[] = [currentLine()]
    for (let p = 1; p <= 7; p++) {
      step()
      seen.push(currentLine())
    }
    // compare 20, right, compare 40, left, compare 30, right, not found
    expect(seen).toEqual([null, 4, 8, 4, 7, 4, 8, 9])
  })

  it('the current line has the marker and the others do not', () => {
    render(<ReplayPlayer operation={{ kind: 'search', tree: CHAIN, key: 10 }} label="Tree" />)
    step()
    const [c] = current()
    expect(c.textContent).toContain('▶')
    for (const li of lines()) if (li !== c) expect(li.textContent).not.toContain('▶')
  })

  it('no pseudocode panel on an insert replay', () => {
    render(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 10 }} label="Tree" />)
    expect(screen.queryByRole('region', { name: /^pseudocode/i })).toBeNull()
  })

  it('property: over search traces, exactly one line is current and it is the step line', () => {
    const check = (op: Operation, form: SearchForm) => {
      const { trace } = traceFor(op, form)
      render(<ReplayPlayer operation={op} label="Tree" />)
      if (form === 'recursive') fireEvent.click(screen.getByRole('radio', { name: /recursive/i }))
      for (let p = 1; p <= trace.length; p++) {
        step()
        expect(current()).toHaveLength(1)
        expect(currentLine()).toBe(trace[p - 1].pseudocodeLine)
        expect(lines().filter((li) => li.textContent!.includes('▶'))).toHaveLength(1)
      }
      cleanup()
    }
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 0, max: 100 }), { maxLength: 15 }),
        fc.integer({ min: -2, max: 102 }),
        fc.constantFrom<SearchForm>('loop', 'recursive'),
        (keys, key, form) => check({ kind: 'search', tree: avl(keys), key }, form),
      ),
      { numRuns: 25 },
    )
  }, 60_000)
})
