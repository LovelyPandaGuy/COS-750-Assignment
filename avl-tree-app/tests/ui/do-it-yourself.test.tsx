import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { makeNode, type Key } from '../../src/engine/tree'
import { DoItYourself } from '../../src/ui/practice/DoItYourself'
import { ModeSwitch } from '../../src/ui/practice/ModeSwitch'

// Spec: add-predict-and-do-it-yourself / do-it-yourself. Requirement IDs: FR-VIS-06, FR-VIS-10, FR-VIS-09, NFR-02. Outcome: LO6.

const leaf = (k: Key) => makeNode(k, null, null)
const T1 = makeNode(30, leaf(20), null) // + 10: left chain, one rotation
const T2 = makeNode(30, leaf(10), null) // + 20: LR, two rotations
const T3 = makeNode(40, makeNode(20, leaf(10), null), leaf(60)) // + 5
const BAL = makeNode(20, leaf(10), leaf(30))

const item = (k: Key) => screen.getByRole('treeitem', { name: new RegExp(`^Node ${k}\\b`) })
const level = (k: Key) => item(k).getAttribute('aria-level')
const btn = (re: RegExp) => screen.getByRole('button', { name: re })
const feedback = () => screen.getByRole('status', { name: /feedback/i })
const updates = () => screen.getByRole('status', { name: /updates/i })
const select = (k: Key) => fireEvent.click(item(k))
const rotate = (k: Key, dir: 'left' | 'right') => {
  select(k)
  fireEvent.click(btn(new RegExp(`rotate ${dir} at ${k}\\b`, 'i')))
}
const strip = () => screen.getAllByRole('list', { name: /in-order/i })[0]
const stripKeys = () => Array.from(strip().querySelectorAll('li')).map((li) => li.textContent!.trim())

describe('FR-VIS-06 Watch or Do it yourself switch', () => {
  const sw = () => render(<ModeSwitch watch={<p>Watch content</p>} base={T1} keyToInsert={10} />)

  it('starts on Watch, showing the supplied content and not the practice', () => {
    sw()
    expect(screen.getByRole('radio', { name: 'Watch' })).toBeChecked()
    expect(screen.getByText('Watch content')).toBeTruthy()
    expect(screen.queryByText(/your turn/i)).toBeNull()
  })

  it('is a labelled group of two native radios with one name', () => {
    sw()
    expect(screen.getByRole('group', { name: 'Mode' })).toBeTruthy()
    const [a, b] = screen.getAllByRole('radio') as HTMLInputElement[]
    expect([a.type, b.type]).toEqual(['radio', 'radio'])
    expect(a.name).toBeTruthy()
    expect(a.name).toBe(b.name)
  })

  it('switches to the practice area and back', () => {
    sw()
    fireEvent.click(screen.getByRole('radio', { name: 'Do it yourself' }))
    expect(screen.getByText(/your turn/i)).toBeTruthy()
    expect(screen.queryByText('Watch content')).toBeNull()
    fireEvent.click(screen.getByRole('radio', { name: 'Watch' }))
    expect(screen.getByText('Watch content')).toBeTruthy()
  })

  it('starts the practice fresh on every entry', () => {
    sw()
    fireEvent.click(screen.getByRole('radio', { name: 'Do it yourself' }))
    rotate(30, 'right')
    expect(level(20)).toBe('1')
    fireEvent.click(screen.getByRole('radio', { name: 'Watch' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Do it yourself' }))
    expect(level(30)).toBe('1')
    expect(btn(/^undo/i)).toBeDisabled()
  })

  it('has 44 px targets in the stylesheet', () => {
    expect(readFileSync('src/ui/practice/practice.css', 'utf8')).toMatch(/\.practice-option[^{]*\{[^}]*min-width:\s*var\(--target-min\)|\.practice-option[^{]*\{[^}]*min-height:\s*var\(--target-min\)/)
  })
})

describe('FR-VIS-06 practice starts from the unbalanced tree', () => {
  it('one rotation: left chain, node 10 new, node 30 at +2', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    expect(screen.getByText(/your turn/i)).toBeTruthy()
    expect(screen.getByText(/one rotation/i)).toBeTruthy()
    expect(level(30)).toBe('1')
    expect(level(20)).toBe('2')
    expect(level(10)).toBe('3')
    expect(item(10).getAttribute('aria-label')).toMatch(/\bnew\b/)
    expect(item(30).getAttribute('aria-label')).toMatch(/balance factor \+2/)
  })

  it('two rotations for LR', () => {
    render(<DoItYourself base={T2} keyToInsert={20} />)
    expect(screen.getByText(/two rotations/i)).toBeTruthy()
  })

  it('says no rotation is needed when the plain insert is balanced, with no editing', () => {
    render(<DoItYourself base={BAL} keyToInsert={5} />)
    expect(screen.getByText(/no rotation/i)).toBeTruthy()
    expect(screen.queryAllByRole('treeitem')).toHaveLength(0)
    expect(screen.queryByRole('group', { name: /rotate at node/i })).toBeNull()
  })
})

describe('FR-VIS-06 / FR-VIS-10 rotation menu', () => {
  it('shows nothing until a node is selected, then a named menu', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    expect(screen.queryByRole('group', { name: /rotate at node/i })).toBeNull()
    select(30)
    const menu = screen.getByRole('group', { name: /rotate at node 30/i })
    expect(menu).toBeTruthy()
    expect(btn(/rotate right at 30/i)).toBeTruthy()
    expect(btn(/rotate left at 30/i)).toBeTruthy()
    expect(btn(/cancel/i)).toBeTruthy()
  })

  it('select then choose, by pointer or touch, with no drag', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    rotate(30, 'right')
    expect(level(20)).toBe('1')
    expect(screen.queryByRole('group', { name: /rotate at node/i })).toBeNull()
  })

  it('keyboard only: Enter on a node, then R', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    item(30).focus()
    fireEvent.keyDown(item(30), { key: 'Enter' })
    fireEvent.keyDown(item(30), { key: 'r' })
    expect(level(20)).toBe('1')
  })

  it('L rotates left', () => {
    render(<DoItYourself base={makeNode(10, null, leaf(20))} keyToInsert={30} />)
    select(10)
    fireEvent.keyDown(item(10), { key: 'L' })
    expect(level(20)).toBe('1')
  })

  it('Esc cancels: selection clears, tree unchanged, focus in the tree', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    item(30).focus()
    fireEvent.keyDown(item(30), { key: 'Enter' })
    fireEvent.keyDown(item(30), { key: 'Escape' })
    expect(screen.queryByRole('group', { name: /rotate at node/i })).toBeNull()
    expect(level(30)).toBe('1')
    expect(screen.getByRole('tree').contains(document.activeElement)).toBe(true)
  })

  it('Cancel button cancels and returns focus to the tree', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    select(30)
    fireEvent.click(btn(/cancel/i))
    expect(screen.queryByRole('group', { name: /rotate at node/i })).toBeNull()
    expect(screen.getByRole('tree').contains(document.activeElement)).toBe(true)
  })

  it('shortcuts are scoped: nothing without a selection, with Ctrl, or from outside', () => {
    render(
      <div>
        <button type="button">outside</button>
        <DoItYourself base={T1} keyToInsert={10} />
      </div>,
    )
    fireEvent.keyDown(item(30), { key: 'r' })
    expect(level(30)).toBe('1')
    select(30)
    fireEvent.keyDown(item(30), { key: 'r', ctrlKey: true })
    expect(level(30)).toBe('1')
    fireEvent.keyDown(screen.getByRole('button', { name: 'outside' }), { key: 'r' })
    expect(level(30)).toBe('1')
  })

  it('offers both directions even when one cannot work', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    select(10)
    for (const b of [btn(/rotate right at 10/i), btn(/rotate left at 10/i)]) {
      expect(b).toBeEnabled()
      expect(b).not.toHaveAttribute('aria-disabled')
    }
  })

  it('lists the keys in a line of help', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    expect(document.body.textContent).toMatch(/Enter/)
    expect(document.body.textContent).toMatch(/Esc/)
    expect(document.body.textContent).toMatch(/Ctrl\+Z|Ctrl \+ Z/)
  })

  it('has no axe violations with a node selected', async () => {
    const { container } = render(<DoItYourself base={T1} keyToInsert={10} />)
    select(30)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FR-VIS-06 student-performed rotation and feedback', () => {
  it('refuses a rotation with no child, naming the node, and leaves the tree and history alone', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    rotate(30, 'left')
    expect(feedback()).toHaveTextContent(/30/)
    expect(feedback()).toHaveTextContent(/no right child/i)
    expect(level(30)).toBe('1')
    expect(btn(/^undo/i)).toBeDisabled()
  })

  it('balanced: says so, mentions the range and the unchanged in-order sequence, and takes focus', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    rotate(30, 'right')
    expect(level(20)).toBe('1')
    expect(feedback()).toHaveTextContent(/balanced/i)
    expect(feedback()).toHaveTextContent(/(−1|-1) and \+1/)
    expect(feedback()).toHaveTextContent(/in-order/i)
    expect(document.activeElement).toBe(feedback())
  })

  it('balanced by another rotation', () => {
    render(<DoItYourself base={T3} keyToInsert={5} />)
    rotate(40, 'right')
    expect(feedback()).toHaveTextContent(/balanced/i)
  })

  it('leans the other way, naming the node and balance factor', () => {
    render(<DoItYourself base={T2} keyToInsert={20} />)
    rotate(30, 'right')
    expect(feedback()).toHaveTextContent(/leans the other way/i)
    expect(feedback()).toHaveTextContent(/10/)
    expect(feedback()).toHaveTextContent(/−2|-2/)
  })

  it('still unbalanced names the lowest node', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    rotate(20, 'right')
    expect(feedback()).toHaveTextContent(/30/)
    expect(feedback()).toHaveTextContent(/\+2/)
    expect(feedback()).toHaveTextContent(/still/i)
  })

  it('double rotation takes two steps', () => {
    render(<DoItYourself base={T2} keyToInsert={20} />)
    rotate(10, 'left')
    expect(feedback()).toHaveTextContent(/30/)
    expect(feedback()).toHaveTextContent(/\+2/)
    rotate(30, 'right')
    expect(feedback()).toHaveTextContent(/balanced/i)
  })

  it('not-balanced kinds say the attempt is not counted and suggest Undo, with no red wording', () => {
    for (const run of [() => rotate(20, 'right')]) {
      render(<DoItYourself base={T1} keyToInsert={10} />)
      run()
      expect(feedback().textContent).toMatch(/not counted/i)
      expect(feedback().textContent).toMatch(/undo/i)
      expect(feedback().textContent).toMatch(/not quite yet/i)
      expect(feedback().textContent).not.toMatch(/wrong|incorrect|fail/i)
    }
  })

  it('leans-the-other-way also says not counted and Undo', () => {
    render(<DoItYourself base={T2} keyToInsert={20} />)
    rotate(30, 'right')
    expect(feedback().textContent).toMatch(/not counted/i)
    expect(feedback().textContent).toMatch(/undo/i)
  })

  it('each kind starts with a distinct word or icon', () => {
    const first = (base: typeof T1, k: number, key: number, dir: 'left' | 'right') => {
      const { unmount } = render(<DoItYourself base={base} keyToInsert={key} />)
      rotate(k, dir)
      const w = feedback().textContent!.trim().split(/\s+/)[0]
      unmount()
      return w
    }
    const words = [first(T1, 30, 10, 'right'), first(T2, 30, 20, 'right'), first(T1, 20, 10, 'right'), first(T1, 30, 10, 'left')]
    expect(new Set(words).size).toBe(4)
  })
})

describe('LO6 in-order strip', () => {
  it('shows the sequence and says it stays identical', () => {
    render(<DoItYourself base={T3} keyToInsert={5} />)
    expect(stripKeys()).toEqual(['5', '10', '20', '40', '60'])
    expect(screen.getByText(/stays identical after any rotation/i)).toBeTruthy()
  })

  it('is unchanged by rotations and undo', () => {
    render(<DoItYourself base={T3} keyToInsert={5} />)
    rotate(20, 'right')
    expect(stripKeys()).toEqual(['5', '10', '20', '40', '60'])
    rotate(40, 'right')
    expect(stripKeys()).toEqual(['5', '10', '20', '40', '60'])
    fireEvent.click(btn(/^undo/i))
    expect(stripKeys()).toEqual(['5', '10', '20', '40', '60'])
  })
})

describe('FR-VIS-06 undo and reset', () => {
  it('undo restores the tree exactly, disables itself, and says so', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    expect(btn(/^undo/i)).toBeDisabled()
    rotate(30, 'right')
    expect(btn(/^undo/i)).toBeEnabled()
    fireEvent.click(btn(/^undo/i))
    expect(level(30)).toBe('1')
    expect(level(10)).toBe('3')
    expect(btn(/^undo/i)).toBeDisabled()
    expect(updates()).toHaveTextContent(/undone/i)
    expect(feedback().textContent!.trim()).toBe('')
  })

  it('undo through several rotations', () => {
    render(<DoItYourself base={T3} keyToInsert={5} />)
    rotate(20, 'right')
    rotate(10, 'left')
    rotate(40, 'right')
    for (let i = 0; i < 3; i++) fireEvent.click(btn(/^undo/i))
    expect(level(40)).toBe('1')
    expect(btn(/^undo/i)).toBeDisabled()
  })

  it('reset returns to the start with no feedback', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    rotate(30, 'right')
    fireEvent.click(btn(/^reset/i))
    expect(level(30)).toBe('1')
    expect(btn(/^undo/i)).toBeDisabled()
    expect(feedback().textContent!.trim()).toBe('')
    expect(updates()).toHaveTextContent(/reset/i)
  })

  it('Ctrl+Z and Cmd+Z undo when focus is inside the practice area, and not outside', () => {
    render(
      <div>
        <button type="button">outside</button>
        <DoItYourself base={T1} keyToInsert={10} />
      </div>,
    )
    rotate(30, 'right')
    fireEvent.keyDown(screen.getByRole('button', { name: 'outside' }), { key: 'z', ctrlKey: true })
    expect(level(20)).toBe('1')
    fireEvent.keyDown(feedback(), { key: 'z', ctrlKey: true })
    expect(level(30)).toBe('1')
    rotate(30, 'right')
    fireEvent.keyDown(feedback(), { key: 'z', metaKey: true })
    expect(level(30)).toBe('1')
  })
})

describe('FR-VIS-06 practice is not graded', () => {
  it('shows no score, attempt count or pass or fail after several attempts', () => {
    const { container } = render(<DoItYourself base={T1} keyToInsert={10} />)
    rotate(30, 'left')
    rotate(20, 'right')
    expect(container.textContent).not.toMatch(/\b(score|pass|fail\w*|marks?)\b/i)
    expect(container.textContent).not.toMatch(/\d+\s+attempts?/i)
  })

  it('uses the interactive tree view', () => {
    render(<DoItYourself base={T1} keyToInsert={10} />)
    expect(screen.getByRole('tree')).toBeTruthy()
    expect(screen.getByRole('tree').closest('[role="region"]')).toHaveAccessibleName()
  })

  it('keeps wording in content and out of the components', () => {
    for (const f of ['DoItYourself', 'RotationMenu', 'FeedbackPanel', 'InOrderStrip', 'ModeSwitch', 'PredictPrompt', 'PredictionReveal']) {
      const src = readFileSync(`src/ui/practice/${f}.tsx`, 'utf8')
      expect(src, f).toMatch(/content\/practice/)
    }
  })

  it('has 44 px targets for buttons in the stylesheet', () => {
    expect(readFileSync('src/ui/practice/practice.css', 'utf8')).toMatch(/\.practice-button[^{]*\{[^}]*min-height:\s*var\(--target-min\)/)
  })
})
