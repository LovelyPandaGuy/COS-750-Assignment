import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { controlsCopy } from '../../src/content/controls'
import { sandboxCopy as copy } from '../../src/content/sandbox'
import { BREAKPOINTS } from '../../src/ui/breakpoints'
import { SHORTCUTS } from '../../src/ui/controls/shortcuts'
import { backendWith, renderRoutes } from './learner-fixtures'

// Spec: revamp-sandbox-layout / sandbox "Two-column layout", "Named sections in the control column",
// "Sandbox controls are the shared control bar"; tree-controls "The control bar" (D140, D141, D136 to D139;
// FR-VIS-08, FR-VIS-10, NFR-02, NFR-04, ID 8.1, ID 8.2, wireframe 1n).

const open = () => renderRoutes(backendWith(), '/sandbox')
const field = () => screen.getByRole('spinbutton', { name: copy.fieldLabel })
const button = (name: string | RegExp) => screen.getByRole('button', { name })
function insertKeys(...keys: number[]) {
  for (const k of keys) {
    fireEvent.change(field(), { target: { value: String(k) } })
    fireEvent.click(button(copy.insert))
  }
}
const css = () => readFileSync('src/ui/sandbox/sandbox.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const controlHeadings = [copy.sections.change, copy.sections.rebalancing, copy.sections.numbers]
const headings = [...controlHeadings, copy.sections.log]

describe('sandbox: two-column layout (D140, wireframe 1n)', () => {
  it('the tree column comes first in the DOM and holds the replay', () => {
    const { container } = open()
    insertKeys(10, 20, 30)
    const tree = container.querySelector('.sandbox-tree-col')!
    const controls = container.querySelector('.sandbox-control-col')!
    expect(tree).not.toBeNull()
    expect(controls).not.toBeNull()
    expect(tree.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(tree as HTMLElement).getByRole('button', { name: copy.replay })).toBeInTheDocument()
    expect(tree.querySelector('.tree-scroll')).not.toBeNull()
    expect(controls.contains(screen.getByRole('toolbar'))).toBe(true)
  })

  it('two columns from the tablet breakpoint, controls first column; one column below', () => {
    expect(BREAKPOINTS.tablet).toBe(768)
    const text = css()
    const wide = /@media\s*\(min-width:\s*768px\)\s*\{([\s\S]*?)\n\}/.exec(text)
    expect(wide).not.toBeNull()
    expect(wide![1]).toMatch(/\.sandbox-layout\s*\{[^}]*display:\s*grid/)
    expect(wide![1]).toMatch(/\.sandbox-control-col\s*\{[^}]*grid-column:\s*1/)
    expect(wide![1]).toMatch(/\.sandbox-tree-col\s*\{[^}]*grid-column:\s*2/)
    const narrow = text.replace(wide![0], '')
    expect(narrow).toMatch(/\.sandbox-layout\s*\{[^}]*flex-direction:\s*column/)
    expect(narrow).not.toMatch(/\.sandbox-layout\s*\{[^}]*display:\s*grid/)
  })

  it('no fixed width wider than a 360 px phone', () => {
    for (const m of css().matchAll(/(?:^|[^-])width:\s*(\d+)px/g)) expect(Number(m[1])).toBeLessThanOrEqual(360)
  })
})

describe('sandbox: named sections in the control column (D141, ID 8.1)', () => {
  it('level-2 headings in order in the control column', () => {
    const { container } = open()
    const col = container.querySelector('.sandbox-control-col') as HTMLElement
    expect(within(col).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(controlHeadings)
  })

  it('"What happened" sits under the tree, before the replay (user, 14 Nov)', () => {
    const { container } = open()
    insertKeys(10, 20, 30)
    const treeCol = container.querySelector('.sandbox-tree-col') as HTMLElement
    const logSection = screen.getByRole('region', { name: copy.sections.log })
    expect(treeCol.contains(logSection)).toBe(true)
    const treeBox = treeCol.querySelector('.tree-scroll')!
    const replay = within(treeCol).getByRole('button', { name: copy.replay })
    expect(treeBox.compareDocumentPosition(logSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(logSection.compareDocumentPosition(replay) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('a long log scrolls in its own focusable box, so it never pushes the controls far down', () => {
    open()
    expect(screen.getByRole('log', { name: copy.logLabel })).toHaveAttribute('tabindex', '0')
    expect(css()).toMatch(/\.sandbox-log\s*\{[^}]*max-height:[^}]*overflow-y:\s*auto/)
  })

  it('more room between the columns on a wide screen', () => {
    const wide = /@media\s*\(min-width:\s*768px\)\s*\{([\s\S]*?)\n\}/.exec(css())!
    expect(wide[1]).toMatch(/\.sandbox-layout\s*\{[^}]*gap:\s*var\(--space-8\)/)
  })

  it('each section is a region named by its heading', () => {
    open()
    for (const h of headings) expect(screen.getByRole('region', { name: h })).toBeInTheDocument()
  })
})

describe('sandbox: controls are the shared control bar (D137 to D139)', () => {
  it('bar order, no primary', () => {
    open()
    const bar = within(screen.getByRole('toolbar'))
    const order = [copy.insert, copy.delete, copy.sorted, copy.random, copy.clear].map((n) => bar.getByRole('button', { name: n }))
    expect(bar.getAllByRole('button')).toEqual(order)
    for (const b of order) {
      expect(b).toHaveClass('btn')
      expect(b.className).not.toMatch(/btn-primary|module-button/)
    }
  })

  it('Enter in the key field inserts', () => {
    open()
    fireEvent.change(field(), { target: { value: '42' } })
    fireEvent.submit(field().closest('form')!)
    expect(screen.getByRole('treeitem', { name: /^Node 42\b/ })).toBeInTheDocument()
  })

  it("keyboard help lists the sandbox's keys and no rotation or step key", () => {
    open()
    fireEvent.click(button(controlsCopy.help.show))
    const list = screen.getByRole('region', { name: controlsCopy.help.heading })
    for (const id of ['treeMove', 'treeSelect', 'barMove', 'fieldInsert'] as const) expect(list.textContent).toContain(SHORTCUTS[id].action)
    for (const id of ['rotateRight', 'rotateLeft', 'undo', 'stepPlay', 'stepSpeed'] as const) expect(list.textContent).not.toContain(SHORTCUTS[id].action)
  })

  it('axe with keyboard help open and keys in the tree', async () => {
    const { container } = open()
    insertKeys(10, 20, 30)
    fireEvent.click(button(controlsCopy.help.show))
    expect(await axe(container)).toHaveNoViolations()
  }, 60_000)
})
