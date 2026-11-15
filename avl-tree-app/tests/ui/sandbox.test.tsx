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
  it('keeps the Sandbox heading and links back to the current lesson (remove-path-page, D159)', () => {
    open()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(screenCopy.headings.sandbox)
    const back = screen.getByRole('link', { name: /^← Back to C1\b/ })
    expect(back.getAttribute('href')).toMatch(/\/module\/C1$/)
    expect(screen.queryByRole('link', { name: /back to path/i })).toBeNull()
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
    // align-sandbox-explanations (D161): a heading, then every step in the lessons' captions.
    expect(first.querySelector('.sandbox-log-heading')).toHaveTextContent('Inserted 7')
    expect([...first.querySelectorAll('li')].map((li) => li.textContent)).toEqual([
      '7 > 6: go right.',
      '7 goes in the empty right branch of 6.',
      'Node 6: bf = 0 − (−1) = +1.',
      'Every node has a balance factor of −1, 0 or +1.',
      copy.noRotation,
    ])
  })
})

describe('D163 replay the last change', () => {
  const sentences = () => {
    // Step through the replay and collect every caption it shows, in order, without repeats.
    const out: string[] = []
    const status = () => screen.getByRole('status', { name: /step explanation/i }).textContent ?? ''
    const step = () => screen.getByRole('button', { name: /^step/i })
    while (!step().hasAttribute('disabled')) {
      fireEvent.click(step())
      const t = status()
      if (out.at(-1) !== t) out.push(t)
    }
    return out
  }
  const logSteps = () => [...within(log()).getAllByRole('listitem')[0].querySelectorAll('li')].map((li) => li.textContent ?? '')

  it('after an insert with rebalancing on: the replay, whose captions follow the log entry', () => {
    open()
    insertKeys(10, 20, 30)
    const b = button(copy.replay)
    expect(b).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(b)
    expect(b).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('group', { name: replayCopy.controls.label })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /^pseudocode/i })).toBeNull() // ID 7.4: no insert listing
    const shown = sentences()
    const steps = logSteps()
    expect(shown.length).toBeGreaterThan(3)
    let i = 0
    for (const t of shown) {
      i = steps.indexOf(t, i)
      expect(i, t).toBeGreaterThanOrEqual(0)
    }
  })

  it('with rebalancing off too: the plain insert, no rotation', () => {
    open()
    turnOff()
    insertKeys(6, 7)
    fireEvent.click(button(copy.replay))
    const shown = sentences()
    expect(shown.at(-1)).toBe('Node 6: bf = 0 − (−1) = +1.')
    expect(shown.some((t) => /rotat/i.test(t))).toBe(false)
  })

  it('replay a delete: from the tree with 10, ending at 40(20(·, 30), 50), no pseudocode', () => {
    const { container } = open()
    insertKeys(20, 10, 40, 30, 50)
    fireEvent.change(field(), { target: { value: '10' } })
    fireEvent.click(button(copy.delete))
    fireEvent.click(button(copy.replayDelete))
    const replay = container.querySelector('.replay') as HTMLElement
    expect(replay.querySelector('[data-key="10"]')).not.toBeNull()
    const shown = sentences()
    expect(shown[0]).toBe('10 is a leaf: remove it.')
    expect(shown).toContain('Rotate 40 around 20: left rotation about 20.')
    expect(replay.querySelector('[data-key="10"]')).toBeNull()
    expect(screen.queryByRole('region', { name: /^pseudocode/i })).toBeNull()
  })

  it('not offered after the sorted shortcut, a rebuild or Clear; the availability line instead', () => {
    for (const act of [() => fireEvent.click(button(copy.sorted)), () => turnOff(), () => fireEvent.click(button(copy.clear))]) {
      const { unmount } = open()
      insertKeys(10)
      act()
      expect(screen.queryByRole('button', { name: copy.replay })).toBeNull()
      expect(screen.queryByRole('button', { name: copy.replayDelete })).toBeNull()
      expect(screen.getByText(copy.replayUnavailable)).toBeInTheDocument()
      unmount()
    }
  })

  it('only the last change: an insert then a delete offers the delete', () => {
    open()
    insertKeys(10, 20, 30)
    fireEvent.change(field(), { target: { value: '30' } })
    fireEvent.click(button(copy.delete))
    expect(button(copy.replayDelete)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: copy.replay })).toBeNull()
  })

  it('a node with children: the calm not-a-leaf message, tree unchanged', () => {
    open()
    insertKeys(10, 20, 30)
    fireEvent.change(field(), { target: { value: '20' } })
    fireEvent.click(button(copy.delete))
    expect(nodeKeys().sort((a, b) => a - b)).toEqual([10, 20, 30])
    expect(notice()).toHaveTextContent(copy.notice({ kind: 'notLeaf', key: 20 }))
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
    fireEvent.click(screen.getByRole('link', { name: /^← Back to C1\b/ }))
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
