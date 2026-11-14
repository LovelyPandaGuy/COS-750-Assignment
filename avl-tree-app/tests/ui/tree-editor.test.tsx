import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync, existsSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { avlInsert } from '../../src/engine/avl'
import { rotateAt } from '../../src/engine/rotations'
import { shapeString } from '../../src/engine/shape'
import type { Key, Tree } from '../../src/engine/tree'
import { keysToInsert, startTree, workTree } from '../../src/live/engineAnswer'
import { encodeKey } from '../../src/live/keys'
import { lessonById, loadContent } from '../../src/live/load'
import type { Question } from '../../src/live/types'
import { targetsOf } from '../../src/ui/lesson/questions/builder'
import { TreeBuilder } from '../../src/ui/lesson/questions/Controls'

// Spec: revamp-tree-editor / tree-editor (D3, D132 to D135; FR-VIS-06, FR-VIS-07, FR-VIS-09, FR-VIS-10,
// NFR-02, ID 8.3, ID 9.6, LO4). Updated by revamp-tree-controls (D136 to D139): order, aria-disabled, help.

const content = loadContent().content!
const lessonTasks = ['c2', 'c5', 'c6', 'c7'].flatMap((l) => lessonById(l)!.screens.flatMap((s) => ('task' in s && s.task ? [s.task as Question] : [])))
const all: Question[] = [...content.checks.questions, ...content.readiness.questions, ...lessonTasks]
const question = (id: string) => {
  const q = all.find((x) => x.id === id)
  if (q === undefined) throw new Error(`no question ${id}`)
  return q
}
const avl = (keys: number[]) => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

let lastTree: Tree = null
function editor(props: { start: Tree; pending?: Key[]; deletable?: Key | null; formatKey?: (k: Key) => string; disabled?: boolean }) {
  const onChange = vi.fn((tree: Tree) => {
    lastTree = tree
  })
  const r = render(
    <TreeBuilder
      start={props.start}
      pending={props.pending ?? []}
      deletable={props.deletable ?? null}
      formatKey={props.formatKey ?? String}
      label="The tree"
      disabled={props.disabled ?? false}
      onChange={onChange}
    />,
  )
  return { ...r, onChange, tree: () => lastTree }
}
/** The editor as QuestionCard sets it up for a question. */
function forQuestion(id: string, disabled = false) {
  const q = question(id)
  const { formatKey } = startTree(q)
  const op = q.operation
  return {
    q,
    start: workTree(q),
    ...editor({
      start: workTree(q),
      pending: q.type === 'perform-rotation' ? [] : keysToInsert(q),
      deletable: op?.name === 'delete' && op.key !== undefined ? encodeKey(op.key) : null,
      formatKey,
      disabled,
    }),
  }
}

const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const slots = () => screen.queryAllByRole('button', { name: /^Empty (branch|tree)/ })
const node = (root: Element, key: Key) => root.querySelector(`[data-key="${key}"]`) as SVGGElement
const press = (key: string, init: Partial<KeyboardEventInit> = {}) => fireEvent.keyDown(document.activeElement ?? document.body, { key, ...init })
const slotName = (t: { parent: Key | null; side: 'left' | 'right' | null }) => (t.parent === null ? 'Empty tree, root' : `Empty branch, ${t.side} of ${t.parent}`)
const log = () => screen.getByRole('list', { name: 'Your edits' })
const css = () => readFileSync('src/ui/editor/editor.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

beforeEach(() => {
  lastTree = null
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => vi.restoreAllMocks())

describe('tree-editor: select the next key, then place it (D132, D3)', () => {
  it('place by tapping a slot (c2-s01-task)', () => {
    forQuestion('c2-s01-task')
    fireEvent.click(btn('Place 10'))
    expect(slots().map((s) => s.getAttribute('aria-label'))).toEqual(['Empty tree, root'])
    fireEvent.click(btn('Empty tree, root'))
    fireEvent.click(btn('Place 20'))
    fireEvent.click(btn('Empty branch, right of 10'))
    expect(shapeString(lastTree)).toBe('10(·, 20)')
    expect(btn('Place 30')).toBeEnabled()
  })

  it('no slots until a key is held, then one per empty branch (chk6-04)', () => {
    const { start } = forQuestion('chk6-04')
    expect(slots()).toHaveLength(0)
    fireEvent.click(btn('Place 27'))
    expect(slots().map((s) => s.getAttribute('aria-label')).sort()).toEqual(targetsOf(start).map(slotName).sort())
  })

  it('Esc or Place again lets go', () => {
    const { start } = forQuestion('chk6-04')
    fireEvent.click(btn('Place 27'))
    btn('Place 27').focus()
    press('Escape')
    expect(slots()).toHaveLength(0)
    fireEvent.click(btn('Place 27'))
    fireEvent.click(btn('Place 27'))
    expect(slots()).toHaveLength(0)
    expect(shapeString(lastTree)).toBe(shapeString(start))
  })

  it('all placed: Place is disabled and the status says so', () => {
    forQuestion('chk6-04')
    fireEvent.click(btn('Place 27'))
    fireEvent.click(btn('Empty branch, right of 25'))
    const place = screen.getByRole('button', { name: /^Place/ })
    expect(place).toHaveAttribute('aria-disabled', 'true')
    const before = shapeString(lastTree)
    fireEvent.click(place)
    expect(slots()).toHaveLength(0)
    expect(shapeString(lastTree)).toBe(before)
    expect(screen.getByText('Every key is placed.')).toBeInTheDocument()
  })
})

describe('tree-editor: wrong placements are drawn, not prevented (D110, D132)', () => {
  it('a wrong branch is accepted with no verdict', () => {
    const r = editor({ start: avl([20, 10, 30]), pending: [25] })
    fireEvent.click(btn('Place 25'))
    fireEvent.click(btn('Empty branch, left of 10'))
    expect(shapeString(lastTree)).toBe('20(10(25, ·), 30)')
    expect(r.container.textContent).not.toMatch(/That’s right|Not quite|Almost there/)
  })

  it('the placed node says "Placed by you" and has its own ring', () => {
    const r = editor({ start: avl([20, 10, 30]), pending: [25] })
    fireEvent.click(btn('Place 25'))
    fireEvent.click(btn('Empty branch, right of 10'))
    expect(node(r.container, 25).getAttribute('aria-label')).toMatch(/placed by you/i)
    expect(node(r.container, 25).getAttribute('data-ring')).not.toBe(node(r.container, 30).getAttribute('data-ring'))
  })
})

describe('tree-editor: slots are targets for touch, pointer and keyboard (FR-VIS-10, NFR-02)', () => {
  it('slot names and 44 px hit areas', () => {
    const r = editor({ start: avl([20, 10, 30]), pending: [25] })
    fireEvent.click(btn('Place 25'))
    expect(slots().map((s) => s.getAttribute('aria-label'))).toEqual([
      'Empty branch, left of 10',
      'Empty branch, right of 10',
      'Empty branch, left of 30',
      'Empty branch, right of 30',
    ])
    for (const s of slots()) {
      const hit = s.querySelector('.editor-slot-hit')!
      expect(Number(hit.getAttribute('width'))).toBeGreaterThanOrEqual(44)
      expect(Number(hit.getAttribute('height'))).toBeGreaterThanOrEqual(44)
    }
    expect(r.container.querySelectorAll('.editor-slot[tabindex="0"]')).toHaveLength(1)
  })

  it('keyboard placement: arrows move in in-order order, Enter places', () => {
    editor({ start: avl([20, 10, 30]), pending: [25] })
    fireEvent.click(btn('Place 25'))
    ;(document.querySelector('.editor-slot[tabindex="0"]') as SVGGElement).focus()
    press('ArrowRight')
    press('ArrowRight')
    press('Enter')
    expect(shapeString(lastTree)).toBe('20(10, 30(25, ·))')
  })

  it('not colour alone: dashed outline and the word "empty"', () => {
    editor({ start: avl([20, 10, 30]), pending: [25] })
    fireEvent.click(btn('Place 25'))
    for (const s of slots()) {
      expect(s.querySelector('.editor-slot-ring')).not.toBeNull()
      expect(s.textContent).toContain('empty')
    }
    expect(css()).toMatch(/\.editor-slot-ring[^{]*\{[^}]*stroke-dasharray/)
  })
})

describe('tree-editor: the rotation menu at the selected node (D133, ID 8.3)', () => {
  it('rotate from the menu (chk5-03)', () => {
    const { start, container } = forQuestion('chk5-03')
    fireEvent.click(node(container, 40))
    expect(btn('Rotate right at 40')).toBeInTheDocument()
    expect(btn('Rotate left at 40')).toBeInTheDocument()
    expect(btn('Cancel')).toBeInTheDocument()
    fireEvent.click(btn('Rotate right at 40'))
    const r = rotateAt(start, 40, 'right')
    expect(r.ok && shapeString(lastTree)).toBe(r.ok && shapeString(r.tree))
    expect(screen.queryByRole('button', { name: 'Rotate right at 40' })).toBeNull()
    expect(container.querySelector('[aria-selected="true"]')).toBeNull()
  })

  it('R and L rotate, Esc cancels', () => {
    const r = editor({ start: avl([20, 10, 30]) })
    node(r.container, 20).focus()
    press('Enter')
    press('r')
    expect(shapeString(lastTree)).toBe('10(·, 20(·, 30))')
    node(r.container, 20).focus()
    press('Enter')
    press('Escape')
    expect(screen.queryByRole('button', { name: /^Rotate/ })).toBeNull()
  })

  it('an impossible rotation is explained', () => {
    const r = editor({ start: avl([20, 10, 30]) })
    node(r.container, 30).focus()
    press('Enter')
    press('l')
    expect(shapeString(lastTree)).toBe('20(10, 30)')
    expect(screen.getByText('30 has no right child to rotate up.')).toBeInTheDocument()
  })

  it('selecting a node lets go of a held key', () => {
    const r = editor({ start: avl([20, 10, 30]), pending: [25] })
    fireEvent.click(btn('Place 25'))
    fireEvent.click(node(r.container, 20))
    expect(slots()).toHaveLength(0)
    expect(btn('Rotate right at 20')).toBeInTheDocument()
  })

  it('the menu buttons declare their keys', () => {
    const r = editor({ start: avl([20, 10, 30]) })
    fireEvent.click(node(r.container, 20))
    expect(btn('Rotate right at 20')).toHaveAttribute('aria-keyshortcuts', 'R')
    expect(btn('Rotate left at 20')).toHaveAttribute('aria-keyshortcuts', 'L')
    expect(btn('Cancel')).toHaveAttribute('aria-keyshortcuts', 'Escape')
  })

  it('placement by width: in flow below 768 px, beside the node from 768 px', () => {
    const text = css()
    const wide = /@media\s*\(min-width:\s*768px\)\s*\{([\s\S]*?)\n\}/.exec(text)
    expect(wide).not.toBeNull()
    expect(wide![1]).toMatch(/\.editor-menu[^{]*\{[^}]*position:\s*absolute/)
    expect(wide![1]).toMatch(/var\(--menu-x\)/)
    const narrow = text.replace(wide![0], '')
    expect(narrow).not.toMatch(/\.editor-menu[^{]*\{[^}]*position:\s*absolute/)
  })
})

describe('tree-editor: undo, reset and delete (ID 8.3, D41)', () => {
  it('rotate, then Ctrl+Z (chk5-03)', () => {
    const { start, container } = forQuestion('chk5-03')
    fireEvent.click(node(container, 40))
    fireEvent.click(btn('Rotate right at 40'))
    btn('Undo').focus()
    press('z', { ctrlKey: true })
    expect(shapeString(lastTree)).toBe(shapeString(start))
  })

  it('Cmd+Z undoes too', () => {
    const r = editor({ start: avl([20, 10, 30]) })
    fireEvent.click(node(r.container, 20))
    fireEvent.click(btn('Rotate right at 20'))
    btn('Undo').focus()
    press('z', { metaKey: true })
    expect(shapeString(lastTree)).toBe('20(10, 30)')
  })

  it('Undo and Reset are disabled with nothing to undo', () => {
    forQuestion('c2-s01-task')
    expect(btn('Undo')).toHaveAttribute('aria-disabled', 'true')
    expect(btn('Reset')).toHaveAttribute('aria-disabled', 'true')
  })

  it('bar order: Place key, Delete 10, Undo, Reset (chk7-03, D136)', () => {
    forQuestion('chk7-03')
    const bar = within(screen.getByRole('toolbar'))
    const order = ['Place key', 'Delete 10', 'Undo', 'Reset'].map((n) => bar.getByRole('button', { name: n }))
    expect(bar.getAllByRole('button')).toEqual(order)
  })

  it('reset (c2-s01-task)', () => {
    forQuestion('c2-s01-task')
    for (const [key, slot] of [[10, 'Empty tree, root'], [20, 'Empty branch, right of 10']] as const) {
      fireEvent.click(btn(`Place ${key}`))
      fireEvent.click(btn(slot))
    }
    fireEvent.click(btn('Reset'))
    expect(lastTree).toBeNull()
    expect(btn('Place 10')).toBeEnabled()
  })

  it('delete a leaf (chk7-03)', () => {
    const { container } = forQuestion('chk7-03')
    fireEvent.click(btn('Delete 10'))
    expect(node(container, 10)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete 10' })).toBeNull()
  })

  it('no editor button is primary', () => {
    const r = forQuestion('chk7-03')
    expect(r.container.querySelectorAll('.module-button-primary')).toHaveLength(0)
  })
})

describe('tree-editor: the edit log (D134, FR-VIS-07)', () => {
  it('empty, then one numbered sentence per edit', () => {
    forQuestion('c2-s01-task')
    expect(screen.getByText('No edits yet')).toBeInTheDocument()
    fireEvent.click(btn('Place 10'))
    fireEvent.click(btn('Empty tree, root'))
    fireEvent.click(btn('Place 20'))
    fireEvent.click(btn('Empty branch, right of 10'))
    expect(log().tagName).toBe('OL')
    expect(within(log()).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Placed 10 at the root', 'Placed 20 as the right child of 10'])
  })

  it('rotation and delete sentences; undo removes the last line', () => {
    const r = editor({ start: avl([20, 10, 30]), deletable: 30 })
    fireEvent.click(node(r.container, 20))
    fireEvent.click(btn('Rotate right at 20'))
    expect(within(log()).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Rotated right at 20'])
    fireEvent.click(btn('Undo'))
    expect(screen.queryByRole('list', { name: 'Your edits' })).toBeNull()
    expect(screen.getByText('No edits yet')).toBeInTheDocument()
    fireEvent.click(btn('Delete 30'))
    expect(within(log()).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Deleted 30'])
  })

  it('letter keys', () => {
    const letter = (k: Key) => String.fromCharCode(64 + k)
    editor({ start: null, pending: [2], formatKey: letter })
    fireEvent.click(btn('Place B'))
    fireEvent.click(btn('Empty tree, root'))
    expect(within(log()).getByRole('listitem')).toHaveTextContent('Placed B at the root')
  })

  it('no verdict for a wrong placement, and the new line is announced', () => {
    editor({ start: avl([20, 10, 30]), pending: [25] })
    fireEvent.click(btn('Place 25'))
    fireEvent.click(btn('Empty branch, left of 10'))
    expect(log().textContent).toBe('Placed 25 as the left child of 10')
    expect(screen.getByRole('status')).toHaveTextContent('Placed 25 as the left child of 10')
  })
})

describe('tree-editor: the in-order strip shows before and after (ID 9.6, LO4)', () => {
  it('before and after a rotation, with the same-order line (chk5-03)', () => {
    const { container } = forQuestion('chk5-03')
    fireEvent.click(node(container, 40))
    fireEvent.click(btn('Rotate right at 40'))
    const before = screen.getByRole('list', { name: 'In-order before' })
    const after = screen.getByRole('list', { name: 'In-order after' })
    expect(before.textContent).toBe(after.textContent)
    expect(screen.getByText('Same order: a rotation keeps the keys in order')).toBeInTheDocument()
  })

  it('a new key is marked with a word', () => {
    editor({ start: avl([20, 10, 30]), pending: [25] })
    fireEvent.click(btn('Place 25'))
    fireEvent.click(btn('Empty branch, left of 30'))
    const item = within(screen.getByRole('list', { name: 'In-order sequence' }))
      .getAllByRole('listitem')
      .find((li) => li.textContent!.startsWith('25'))!
    expect(item).toHaveTextContent('new')
  })

  it('after undo, one sequence again', () => {
    const r = editor({ start: avl([20, 10, 30]) })
    fireEvent.click(node(r.container, 20))
    fireEvent.click(btn('Rotate right at 20'))
    fireEvent.click(btn('Undo'))
    expect(screen.queryByRole('list', { name: 'In-order before' })).toBeNull()
    expect(screen.getByRole('list', { name: 'In-order sequence' })).toBeInTheDocument()
  })
})

describe('tree-editor: the editor works on a phone (D135, D3)', () => {
  it('DOM order: tree region, menu, control bar, strip, log, keyboard help (D136)', () => {
    const { container } = forQuestion('chk5-03')
    fireEvent.click(node(container, 40))
    const parts = ['.tree-scroll', '.editor-menu', '[role="toolbar"]', '.practice-strip', '.editor-log', '.keyboard-help'].map((s) => container.querySelector(s)!)
    for (const p of parts) expect(p).not.toBeNull()
    for (let i = 1; i < parts.length; i++) expect(parts[i - 1].compareDocumentPosition(parts[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('a wide tree scrolls in its own region (c6-s08-task)', () => {
    const { container } = forQuestion('c6-s08-task')
    expect(container.querySelector('.tree-editor .tree-scroll')).not.toBeNull()
    expect(css()).toMatch(/\.tree-editor[^{]*\{[^}]*min-width:\s*0/)
  })

  it('a held key and a selected node are scrolled into view', () => {
    const r = editor({ start: avl([20, 10, 30]), pending: [25] })
    const spy = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>
    fireEvent.click(btn('Place 25'))
    expect(spy).toHaveBeenCalled()
    spy.mockClear()
    fireEvent.click(node(r.container, 30))
    expect(spy).toHaveBeenCalled()
  })

  it('44 px targets for control bar and menu buttons (base Button), and slots', () => {
    expect(existsSync('src/ui/editor/editor.css')).toBe(true)
    expect(readFileSync('src/ui/base/base.css', 'utf8')).toMatch(/\.btn\s*\{[^}]*min-height:\s*var\(--target-min\)/)
    const r = editor({ start: avl([20, 10, 30]), pending: [25] })
    fireEvent.click(node(r.container, 20))
    for (const b of [...within(screen.getByRole('toolbar')).getAllByRole('button'), ...r.container.querySelectorAll('.editor-menu button')]) expect(b).toHaveClass('btn')
  })
})

describe('tree-editor: the editor is accessible (NFR-02, ID 11)', () => {
  it('axe: idle, key held, menu open, locked', async () => {
    const a = forQuestion('chk6-04')
    expect(await axe(a.container), 'idle').toHaveNoViolations()
    fireEvent.click(btn('Place 27'))
    expect(await axe(a.container), 'held').toHaveNoViolations()
    fireEvent.click(node(a.container, 30))
    expect(await axe(a.container), 'menu').toHaveNoViolations()
    fireEvent.click(btn('Show keyboard shortcuts'))
    expect(await axe(a.container), 'help open').toHaveNoViolations()
    a.unmount()
    const b = forQuestion('chk6-04', true)
    expect(await axe(b.container), 'locked').toHaveNoViolations()
  }, 60_000)

  it('locked after checking: nothing takes an edit', () => {
    const { start, container } = forQuestion('chk7-03', true)
    for (const b of [screen.getByRole('button', { name: /^Place/ }), btn('Undo'), btn('Reset'), btn('Delete 10')]) expect(b).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(btn('Delete 10'))
    expect(node(container, 10)).not.toBeNull()
    fireEvent.click(node(container, 20))
    expect(screen.queryByRole('button', { name: /^Rotate/ })).toBeNull()
    node(container, 20).focus()
    press('r')
    expect(lastTree === null || shapeString(lastTree) === shapeString(start)).toBe(true)
  })
})
