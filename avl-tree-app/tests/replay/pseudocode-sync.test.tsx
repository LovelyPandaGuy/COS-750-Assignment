import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import fc from 'fast-check'
import { INSERT_LINES, avlInsert } from '../../src/engine/avl'
import { LOOP_LINES, RECURSIVE_LINES, type SearchForm } from '../../src/engine/search'
import { makeNode, type Key, type Tree } from '../../src/engine/tree'
import { pseudocode } from '../../src/content/pseudocode'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import type { RebalanceCase } from '../../src/engine/conventions'
import { traceFor, type Operation } from '../../src/replay/replay'
import { ReplayPlayer } from '../../src/ui/replay/ReplayPlayer'

// Spec: add-replay-and-pseudocode / pseudocode-panel. Requirement IDs: FR-VIS-04, FR-VIS-02, FR-ENG-04, D5, D12.
// revamp-tree-controls / pseudocode-panel "Case named beside the line": the name comes from conventionsWording().caseName (D19, D31).

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
const caseLabel = () => panel().querySelector('.pseudo-case')
const nameOf = (c: RebalanceCase) => conventionsWording().caseName(c)

describe('FR-VIS-04 listings match the engine line numbers', () => {
  it('has 5, 7 and 5 lines', () => {
    expect(pseudocode.insert).toHaveLength(5)
    expect(pseudocode.searchLoop).toHaveLength(7)
    expect(pseudocode.searchRecursive).toHaveLength(5)
  })

  it('every engine line exists in its listing', () => {
    const fits = (map: Record<string, number>, listing: readonly string[]) =>
      Object.values(map).forEach((n) => expect(n >= 1 && n <= listing.length, `line ${n}`).toBe(true))
    fits(INSERT_LINES, pseudocode.insert)
    fits(LOOP_LINES, pseudocode.searchLoop)
    fits(RECURSIVE_LINES, pseudocode.searchRecursive)
  })

  it('line purposes', () => {
    const loop = pseudocode.searchLoop
    expect(loop[3]).toMatch(/k == v\.key/)
    expect(loop[4]).toMatch(/v\.left/)
    expect(loop[5]).toMatch(/v\.right/)
    expect(loop[6]).toMatch(/return null/)
    const rec = pseudocode.searchRecursive
    expect(rec[1]).toMatch(/v == null/)
    expect(rec[2]).toMatch(/k == v\.key/)
    const ins = pseudocode.insert
    expect(ins[0]).toMatch(/insert/i)
    expect(ins[1]).toMatch(/height/i)
    expect(ins[2]).toMatch(/unbalanced/i)
    expect(ins[3]).toMatch(/case/i)
    expect(ins[4]).toMatch(/rotat/i)
  })

  it('listings never name a case themselves, so a shown case always comes from the step', () => {
    for (const l of [...pseudocode.insert, ...pseudocode.searchLoop, ...pseudocode.searchRecursive]) {
      expect(l).not.toMatch(/\b(LL|RR|LR|RL)\b/)
    }
  })
})

describe('FR-VIS-04 current line is highlighted', () => {
  it('insert example: lines per position', () => {
    render(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 10 }} label="Tree" />)
    const seen: (number | null)[] = [currentLine()]
    for (let p = 1; p <= 9; p++) {
      step()
      seen.push(currentLine())
    }
    expect(seen).toEqual([null, 1, 1, 1, 1, 1, 2, 2, 3, 5])
  })

  it('the current line has the marker and the others do not', () => {
    render(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 10 }} label="Tree" />)
    step()
    const [c] = current()
    expect(c.textContent).toContain('▶')
    for (const li of lines()) if (li !== c) expect(li.textContent).not.toContain('▶')
  })

  it('property: over engine traces, exactly one line is current and it is the step line', () => {
    const check = (op: Operation, form: SearchForm) => {
      const { trace } = traceFor(op, form)
      render(<ReplayPlayer operation={op} label="Tree" />)
      if (op.kind === 'search' && form === 'recursive') fireEvent.click(screen.getByRole('radio', { name: /recursive/i }))
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
        (keys, key, form) => {
          const T = avl(keys)
          check({ kind: 'insert', tree: T, key }, 'loop')
          check({ kind: 'search', tree: T, key }, form)
        },
      ),
      { numRuns: 25 },
    )
  }, 60_000)
})

describe('FR-VIS-04 case named beside the line', () => {
  it('LL at positions 8 and 9, none at 7', () => {
    render(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 10 }} label="Tree" />)
    for (let p = 1; p <= 7; p++) step()
    expect(caseLabel()).toBeNull()
    step()
    expect(current()[0].querySelector('.pseudo-case')?.textContent).toContain(nameOf('LL'))
    step()
    expect(current()[0].querySelector('.pseudo-case')?.textContent).toContain(nameOf('LL'))
  })

  it('property: the case shown equals the step case', () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 0, max: 100 }), { maxLength: 15 }), fc.integer({ min: -2, max: 102 }), (keys, key) => {
        const T = avl(keys)
        const op: Operation = { kind: 'insert', tree: T, key }
        const { trace } = traceFor(op, 'loop')
        render(<ReplayPlayer operation={op} label="Tree" />)
        for (const s of trace) {
          step()
          const shown = caseLabel()?.textContent ?? null
          if (s.rebalanceCase) expect(shown).toContain(nameOf(s.rebalanceCase))
          else expect(shown).toBeNull()
        }
        cleanup()
      }),
      { numRuns: 25 },
    )
  }, 60_000)
})
