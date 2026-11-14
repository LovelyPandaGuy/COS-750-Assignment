import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { avlInsert } from '../../src/engine/avl'
import type { Key, Tree } from '../../src/engine/tree'
import { keysToInsert, startTree, workTree } from '../../src/live/engineAnswer'
import { encodeKey } from '../../src/live/keys'
import { lessonById, loadContent } from '../../src/live/load'
import type { Question } from '../../src/live/types'
import { ControlBar } from '../../src/ui/controls/ControlBar'
import { ControlButton } from '../../src/ui/controls/ControlButton'
import { SHORTCUTS, shortcutsFor } from '../../src/ui/controls/shortcuts'
import { TreeBuilder } from '../../src/ui/lesson/questions/Controls'

// Spec: revamp-tree-controls / tree-controls (D136 to D139; ID 8.3, ID 11.2, NFR-02, FR-VIS-10;
// design system section 04, wireframes 1f, 1h, 1m).

const content = loadContent().content!
const lessonTasks = ['c2', 'c5', 'c6', 'c7'].flatMap((l) => lessonById(l)!.screens.flatMap((s) => ('task' in s && s.task ? [s.task as Question] : [])))
const all: Question[] = [...content.checks.questions, ...content.readiness.questions, ...lessonTasks]
const question = (id: string) => all.find((x) => x.id === id)!
const avl = (keys: number[]) => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

function editor(start: Tree, pending: Key[] = [], deletable: Key | null = null, disabled = false) {
  return render(<TreeBuilder start={start} pending={pending} deletable={deletable} formatKey={String} label="The tree" disabled={disabled} onChange={() => {}} />)
}
function forQuestion(id: string) {
  const q = question(id)
  const op = q.operation
  return render(
    <TreeBuilder
      start={workTree(q)}
      pending={q.type === 'perform-rotation' ? [] : keysToInsert(q)}
      deletable={op?.name === 'delete' && op.key !== undefined ? encodeKey(op.key) : null}
      formatKey={startTree(q).formatKey}
      label="The tree"
      disabled={false}
      onChange={() => {}}
    />,
  )
}
function bar(onUndo = vi.fn()) {
  render(
    <ControlBar label="Edit the tree">
      <ControlButton icon="＋" label="Place 10" onClick={() => {}} />
      <ControlButton icon="−" label="Delete 10" onClick={() => {}} />
      <ControlButton variant="quiet" icon="↶" label="Undo" shortcut="undo" disabled onClick={onUndo} />
      <ControlButton variant="quiet" icon="⟲" label="Reset" onClick={() => {}} />
    </ControlBar>,
  )
  return { buttons: within(screen.getByRole('toolbar')).getAllByRole('button'), onUndo }
}

const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const node = (root: Element, key: Key) => root.querySelector(`[data-key="${key}"]`) as SVGGElement
const press = (key: string) => fireEvent.keyDown(document.activeElement!, { key })
const read = (p: string) => readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const controlsCss = () => read('src/ui/controls/controls.css')
const help = () => screen.getByRole('button', { name: 'Show keyboard shortcuts' })

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('tree-controls: the control bar (D136, ID 8.3)', () => {
  it('sits below the tree region', () => {
    const { container } = editor(avl([20, 10, 30]), [25])
    const tree = container.querySelector('.tree-scroll')!
    const toolbar = screen.getByRole('toolbar')
    expect(tree.compareDocumentPosition(toolbar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps its buttons in the order given: main, other, undo and reset', () => {
    const { buttons } = bar()
    expect(buttons.map((b) => b.textContent)).toEqual(['＋Place 10', '−Delete 10', '↶UndoCtrl+Z', '⟲Reset'])
  })

  it('wraps on a phone and has no fixed width', () => {
    expect(controlsCss()).toMatch(/\.control-bar\s*\{[^}]*flex-wrap:\s*wrap/)
    expect(controlsCss()).not.toMatch(/\.control-bar\s*\{[^}]*[^-]width:\s*\d/)
  })
})

describe('tree-controls: the control bar is one tab stop (D137, ID 11.2)', () => {
  it('exactly one button has tabindex 0', () => {
    const { buttons } = bar()
    expect(buttons.filter((b) => b.getAttribute('tabindex') === '0')).toHaveLength(1)
    expect(buttons[0]).toHaveAttribute('tabindex', '0')
  })

  it('Left, Right, Home and End move focus, wrapping at the ends', () => {
    const { buttons } = bar()
    buttons[0].focus()
    const seen: number[] = []
    for (const k of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'End', 'Home', 'ArrowLeft']) {
      press(k)
      seen.push(buttons.indexOf(document.activeElement as HTMLElement))
    }
    expect(seen).toEqual([1, 2, 1, 3, 0, 3])
    expect(document.activeElement).toHaveAttribute('tabindex', '0')
  })

  it('a disabled button stays focusable and does not act', () => {
    const { buttons, onUndo } = bar()
    buttons[0].focus()
    press('ArrowRight')
    press('ArrowRight')
    expect(document.activeElement).toBe(buttons[2])
    expect(buttons[2]).toHaveAttribute('aria-disabled', 'true')
    expect(buttons[2]).not.toHaveAttribute('disabled')
    fireEvent.click(buttons[2])
    fireEvent.keyDown(buttons[2], { key: 'Enter' })
    expect(onUndo).not.toHaveBeenCalled()
  })
})

describe('tree-controls: control buttons follow the design system (D139, D41)', () => {
  it('base button classes, never primary or the old classes', () => {
    const { container } = editor(avl([20, 10, 30]), [25], 10)
    fireEvent.click(node(container, 20))
    const controls = [...within(screen.getByRole('toolbar')).getAllByRole('button'), ...container.querySelectorAll('.editor-menu button')]
    expect(controls.length).toBeGreaterThanOrEqual(7)
    for (const b of controls) {
      expect(b.classList.contains('btn'), b.textContent!).toBe(true)
      expect(b.classList.contains('btn-secondary') || b.classList.contains('btn-quiet'), b.textContent!).toBe(true)
      expect(b.className).not.toMatch(/btn-primary|module-button|practice-button/)
    }
  })

  it('icon, label, key cap and aria-keyshortcuts', () => {
    const { container } = forQuestion('chk5-03')
    fireEvent.click(node(container, 40))
    const b = btn('Rotate right at 40')
    expect(b.querySelector('[aria-hidden="true"].control-icon')).not.toBeNull()
    expect(b.querySelector('kbd')).toHaveTextContent('R')
    expect(b).toHaveAttribute('aria-keyshortcuts', 'R')
  })

  it('pressed is not colour alone', () => {
    editor(avl([20, 10, 30]), [25])
    fireEvent.click(btn('Place 25'))
    expect(btn('Place 25')).toHaveAttribute('aria-pressed', 'true')
    expect(controlsCss()).toMatch(/\[aria-pressed='true'\][^{]*\{[^}]*border-style:\s*dashed/)
    expect(controlsCss()).toMatch(/\[aria-pressed='true'\][^{]*\{[^}]*--action-primary-tint/)
  })

  it('aria-disabled looks disabled, from the disabled tokens', () => {
    expect(controlsCss()).toMatch(/\[aria-disabled='true'\][^{]*\{[^}]*--disabled-bg[^}]*\}/)
    expect(controlsCss()).toMatch(/\[aria-disabled='true'\][^{]*\{[^}]*--disabled-text/)
  })

  it('44 px targets come from the base button', () => {
    expect(read('src/ui/base/base.css')).toMatch(/\.btn\s*\{[^}]*min-height:\s*var\(--target-min\)/)
  })
})

describe('tree-controls: one shortcut registry (D138)', () => {
  it('every aria-keyshortcuts in the editor is in the help, with the registry wording', () => {
    const { container } = editor(avl([20, 10, 30]), [25])
    fireEvent.click(node(container, 20))
    fireEvent.click(help())
    const list = screen.getByRole('region', { name: 'Keyboard shortcuts' })
    const values = [...container.querySelectorAll('[aria-keyshortcuts]')].map((e) => e.getAttribute('aria-keyshortcuts')!)
    expect(values.length).toBeGreaterThanOrEqual(4)
    for (const v of values) {
      const entry = Object.values(SHORTCUTS).find((s) => s.aria === v)
      expect(entry, v).toBeDefined()
      expect(list.textContent).toContain(entry!.action)
    }
  })

  it('the step keys of wireframe 1f are registered for the replay', () => {
    const replay = shortcutsFor('replay').map((s) => s.aria).join(' ')
    expect(replay).toMatch(/Space/)
    expect(replay).toMatch(/ArrowLeft/)
    expect(replay).toMatch(/ArrowRight/)
    expect(replay).toMatch(/\[/)
    expect(replay).toMatch(/\]/)
  })
})

describe('tree-controls: keyboard help (1h, 1m; ID 11.2)', () => {
  it('closed by default', () => {
    editor(avl([20, 10, 30]))
    expect(help()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('region', { name: 'Keyboard shortcuts' })).toBeNull()
  })

  it("lists the editor's keys and no step key", () => {
    editor(avl([20, 10, 30]))
    fireEvent.click(help())
    expect(help()).toHaveAttribute('aria-expanded', 'true')
    const list = screen.getByRole('region', { name: 'Keyboard shortcuts' })
    for (const s of shortcutsFor('editor')) expect(list.textContent).toContain(s.action)
    for (const id of ['rotateRight', 'rotateLeft', 'cancel', 'undo', 'treeMove', 'treeSelect'] as const) expect(list.textContent).toContain(SHORTCUTS[id].action)
    for (const s of shortcutsFor('replay').filter((r) => !r.screens.includes('editor'))) expect(list.textContent).not.toContain(s.action)
    expect(within(list).getAllByText((_, el) => el?.tagName === 'KBD').length).toBeGreaterThan(0)
  })
})

describe('tree-controls: controls are accessible (NFR-02)', () => {
  it('axe: help closed, open, and with the menu open', async () => {
    const { container } = editor(avl([20, 10, 30]), [25], 10)
    expect(await axe(container), 'closed').toHaveNoViolations()
    fireEvent.click(help())
    expect(await axe(container), 'open').toHaveNoViolations()
    fireEvent.click(node(container, 20))
    expect(await axe(container), 'menu').toHaveNoViolations()
  }, 60_000)
})
