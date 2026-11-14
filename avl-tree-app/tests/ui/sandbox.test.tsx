import { fireEvent, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { replayCopy } from '../../src/content/replay'
import { sandboxCopy as copy } from '../../src/content/sandbox'
import { screenCopy } from '../../src/content/screens'
import { LEARNER_KEY } from '../../src/state/storage'
import { backendWith, renderRoutes } from './learner-fixtures'

// Spec: add-sandbox / sandbox; updated by revamp-sandbox-layout (D137, D140, D141). Requirement IDs: FR-VIS-08, FR-VIS-03, FR-VIS-09, FR-MOT-04, LO1, NFR-02, D3, D11, D19.

const open = () => renderRoutes(backendWith(), '/sandbox')
const field = () => screen.getByRole('spinbutton', { name: copy.fieldLabel })
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const node = (key: number) => screen.getByRole('treeitem', { name: new RegExp(`^Node ${key}\\b`) })
const nodeKeys = () => screen.queryAllByRole('treeitem').map((n) => Number(/^Node (\d+)/.exec(n.getAttribute('aria-label') ?? n.textContent ?? '')?.[1]))
const sw = () => screen.getByRole('switch')
const log = () => screen.getByRole('log', { name: copy.logLabel })
const notice = () => screen.getByRole('status', { name: copy.noticeLabel })

function insertKeys(...keys: number[]) {
  for (const k of keys) {
    fireEvent.change(field(), { target: { value: String(k) } })
    fireEvent.click(button(copy.insert))
  }
}
const turnOff = () => fireEvent.click(sw())

describe('FR-VIS-08 the sandbox screen', () => {
  it('keeps the Sandbox heading and "← Back to path"', () => {
    open()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(screenCopy.headings.sandbox)
    const back = screen.getByRole('link', { name: /back to path/i })
    expect(back).toHaveTextContent('←')
    expect(back.getAttribute('href')).toMatch(/\/path$/)
  })

  it('inserts with rebalancing on: 10, 20, 30 make root 20', () => {
    open()
    insertKeys(10, 20, 30)
    expect(nodeKeys().sort((a, b) => a - b)).toEqual([10, 20, 30])
    // Nodes are listed in key order; the root of three keys is the one of height 1.
    expect(node(20)).toHaveAccessibleName(/height 1\b/)
    expect(node(10)).toHaveAccessibleName(/height 0\b/)
    expect(node(30)).toHaveAccessibleName(/height 0\b/)
  })

  it('tap to delete: selecting a node fills the field, then Delete removes it', () => {
    open()
    insertKeys(10, 20, 30)
    fireEvent.click(node(30))
    expect(field()).toHaveValue(30)
    fireEvent.click(button(copy.delete))
    expect(nodeKeys()).not.toContain(30)
  })

  it('an unusable key leaves the tree and shows a calm notice', () => {
    open()
    insertKeys(20, 20)
    expect(nodeKeys()).toEqual([20])
    expect(notice()).toHaveTextContent(copy.notice({ kind: 'duplicate', key: 20 }))
    insertKeys(100)
    expect(notice()).toHaveTextContent(copy.notice({ kind: 'range' }))
  })
})

describe('D11 rebalancing switch', () => {
  it('says ON, then OFF, as a native switch', () => {
    open()
    expect(sw()).toHaveAttribute('aria-checked', 'true')
    expect(sw()).toHaveTextContent(copy.switchLabel(true))
    expect(copy.switchLabel(true)).toContain('ON')
    turnOff()
    expect(sw()).toHaveAttribute('aria-checked', 'false')
    expect(sw()).toHaveTextContent(copy.switchLabel(false))
    expect(copy.switchLabel(false)).toContain('OFF')
    expect(sw().tagName).toBe('BUTTON')
  })

  it('off, then 1 to 7 in order, shows the chain statistics; on rebuilds to height 2', () => {
    open()
    turnOff()
    fireEvent.click(button(copy.sorted))
    const stats = screen.getByRole('region', { name: copy.sections.numbers })
    expect(stats).toHaveTextContent(copy.stats.nodes(7, 15))
    expect(stats).toHaveTextContent(copy.stats.height(6))
    expect(stats).toHaveTextContent(copy.stats.shortest(2))
    expect(stats).toHaveTextContent(copy.stats.deepest(7, 7))
    fireEvent.click(sw())
    expect(stats).toHaveTextContent(copy.stats.height(2))
  })
})

describe('FR-VIS-08 fifteen-node cap', () => {
  it('when full, Insert, the sorted shortcut and Random key are unavailable (aria-disabled), Delete is not', () => {
    open()
    for (let i = 0; i < 15; i++) fireEvent.click(button(copy.random))
    expect(nodeKeys()).toHaveLength(15)
    for (const name of [copy.insert, copy.random, copy.sorted]) expect(button(name)).toHaveAttribute('aria-disabled', 'true')
    expect(button(copy.delete)).not.toHaveAttribute('aria-disabled')
    expect(screen.getByText(copy.full)).toBeInTheDocument()
  })

  it('an unavailable Insert does nothing', () => {
    open()
    for (let i = 0; i < 15; i++) fireEvent.click(button(copy.random))
    const free = [...Array(99).keys()].map((i) => i + 1).find((k) => !nodeKeys().includes(k))!
    fireEvent.change(field(), { target: { value: String(free) } })
    fireEvent.click(button(copy.insert))
    expect(nodeKeys()).toHaveLength(15)
  })
})

describe('D19 event log', () => {
  it('is a polite log, newest first, worded from the engine result', () => {
    open()
    turnOff()
    insertKeys(6, 7)
    expect(log()).toHaveAttribute('aria-live', 'polite')
    const first = within(log()).getAllByRole('listitem')[0]
    expect(first).toHaveTextContent(copy.log({ kind: 'insert', key: 7, parent: 6, side: 'right', rebalances: [], rebalancing: false }))
  })
})

describe('FR-VIS-03 replay the last insert', () => {
  it('after an insert with rebalancing on, opens the insert replay', () => {
    open()
    insertKeys(10, 20, 30)
    const b = button(copy.replay)
    expect(b).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(b)
    expect(b).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('group', { name: replayCopy.controls.label })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /^pseudocode/i })).toBeNull() // ID 7.4: no insert listing
  })

  it('not offered with rebalancing off; the availability line shows instead', () => {
    open()
    turnOff()
    insertKeys(5)
    expect(screen.queryByRole('button', { name: copy.replay })).toBeNull()
    expect(screen.getByText(copy.replayUnavailable)).toBeInTheDocument()
  })
})

describe('NFR-02 nothing stored, accessible', () => {
  it('inserting, deleting, toggling and clearing writes nothing to the learner state', () => {
    const backend = backendWith()
    renderRoutes(backend, '/sandbox')
    const before = backend.getItem(LEARNER_KEY)
    insertKeys(5, 3, 8)
    fireEvent.click(node(3))
    fireEvent.click(button(copy.delete))
    turnOff()
    fireEvent.click(button(copy.clear))
    fireEvent.click(screen.getByRole('link', { name: /back to path/i }))
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })

  it('every control uses the 44 px classes', () => {
    open()
    for (const b of within(screen.getByRole('main')).getAllByRole('button')) expect(b.className, b.textContent ?? '').toMatch(/\bbtn\b|module-button|sandbox-switch/)
  })

  it('axe: empty, chain, full and with the replay open', async () => {
    const { container } = open()
    expect(await axe(container), 'empty').toHaveNoViolations()
    turnOff()
    fireEvent.click(button(copy.sorted))
    expect(await axe(container), 'chain').toHaveNoViolations()
    fireEvent.click(sw())
    for (let i = 0; i < 8; i++) fireEvent.click(button(copy.random))
    expect(await axe(container), 'full').toHaveNoViolations()
    fireEvent.click(button(copy.clear))
    insertKeys(10, 20, 30)
    fireEvent.click(button(copy.replay))
    expect(await axe(container), 'replay').toHaveNoViolations()
    fireEvent.click(button('Show keyboard shortcuts'))
    expect(await axe(container), 'help open').toHaveNoViolations()
  }, 60_000)
})
