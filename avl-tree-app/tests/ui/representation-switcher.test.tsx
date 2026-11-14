import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { makeNode, type Key } from '../../src/engine/tree'
import type { Representation } from '../../src/modules/schema'
import { RepresentationSwitcher } from '../../src/ui/replay/RepresentationSwitcher'
import { ReplayPlayer } from '../../src/ui/replay/ReplayPlayer'

// Spec: revamp-tree-controls / ui-tree-controls "Representation switcher" (screens 1f and 1h) and
// "Caption under the tree" scenario "Floor never hidden". FR-LRN-02, FR-VIS-06, D22, D26, D106, INDEX item 11.

const leaf = (k: Key) => makeNode(k, null, null)
const CHAIN = makeNode(30, leaf(20), null)
const INSERT = { kind: 'insert' as const, tree: CHAIN, key: 10 }

const show = () => screen.getByRole('group', { name: /^show/i })
const box = (name: RegExp) => within(show()).getByRole('checkbox', { name })
const panel = () => screen.queryByRole('region', { name: /^pseudocode/i })
const wholeTree = () => screen.queryByRole('heading', { name: /^the whole tree$/i })
const caption = () => screen.getAllByRole('status').filter((el) => !el.closest('.tree-view'))[0]
const counter = () => screen.getByText(/^Step \d+ \/ \d+$/).textContent

function renderSwitcher(over: Partial<Parameters<typeof RepresentationSwitcher>[0]> = {}) {
  const props = { primary: 'animation' as Representation, shown: ['diagram', 'text'] as Representation[], onToggle: vi.fn(), ...over }
  return { props, ...render(<RepresentationSwitcher {...props} />) }
}

describe('D106 switcher boxes', () => {
  it('Show group with native checkboxes for Diagram, Text and Pseudocode, in that order', () => {
    renderSwitcher()
    const boxes = within(show()).getAllByRole('checkbox')
    expect(boxes.map((b) => b.getAttribute('type'))).toEqual(['checkbox', 'checkbox', 'checkbox'])
    expect(boxes).toHaveLength(3)
    expect(boxes[0]).toHaveAccessibleName(/diagram/i)
    expect(boxes[1]).toHaveAccessibleName(/text/i)
    expect(boxes[2]).toHaveAccessibleName(/pseudocode/i)
  })

  it('primary animation locks Diagram: checked, disabled and marked "main" in visible text', () => {
    renderSwitcher({ primary: 'animation' })
    const d = box(/diagram/i)
    expect(d).toBeChecked()
    expect(d).toBeDisabled()
    expect(d.closest('label')!.textContent).toMatch(/\bmain\b/i)
    expect(box(/text/i)).toBeEnabled()
    expect(box(/pseudocode/i)).toBeEnabled()
  })

  it('primary pseudocode locks Pseudocode, and only that box says "main"', () => {
    renderSwitcher({ primary: 'pseudocode', shown: ['pseudocode'] })
    expect(box(/pseudocode/i)).toBeChecked()
    expect(box(/pseudocode/i)).toBeDisabled()
    expect(box(/diagram/i)).toBeEnabled()
    const mains = within(show()).getAllByText(/\bmain\b/i)
    expect(mains).toHaveLength(1)
    expect(box(/pseudocode/i).closest('label')!.contains(mains[0])).toBe(true)
  })

  it('other boxes reflect shown, and toggling calls onToggle with that representation', () => {
    const { props } = renderSwitcher({ primary: 'animation', shown: ['diagram', 'text'] })
    expect(box(/text/i)).toBeChecked()
    expect(box(/pseudocode/i)).not.toBeChecked()
    fireEvent.click(box(/pseudocode/i))
    expect(props.onToggle).toHaveBeenCalledWith('pseudocode')
    fireEvent.click(box(/text/i))
    expect(props.onToggle).toHaveBeenCalledWith('text')
  })

  it('D26 no Read aloud control', () => {
    renderSwitcher({ mode: { value: 'watch', onChange: vi.fn() }, task: 'Insert 5 into an AVL tree' })
    expect(screen.queryByRole('checkbox', { name: /read aloud/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /read aloud/i })).toBeNull()
    expect(document.body.textContent).not.toMatch(/read aloud/i)
  })

  it('D22 framed as choices, never learning styles', () => {
    const { container } = renderSwitcher({ mode: { value: 'watch', onChange: vi.fn() } })
    const all = [container.textContent ?? '', ...[...container.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label') ?? '')].join(' ')
    expect(all).not.toMatch(/learning style|learner type|visual learner|auditory/i)
  })

  it('QB8 each box label is a 44 px target (stylesheet)', () => {
    renderSwitcher()
    const css = readFileSync('src/ui/replay/replay.css', 'utf8')
    const label = box(/text/i).closest('label')!
    const cls = [...label.classList]
    expect(cls.length).toBeGreaterThan(0)
    expect(cls.some((c) => new RegExp(`\\.${c}[^{]*\\{[^}]*min-height:\\s*var\\(--target-min\\)`).test(css))).toBe(true)
  })
})

describe('FR-VIS-06 screen 1h: mode in the same bar', () => {
  it('Mode group with Watch and Do it yourself radios; the task text is shown; choosing calls onChange', () => {
    const onChange = vi.fn()
    renderSwitcher({ mode: { value: 'do', onChange }, task: 'Insert 5 into an AVL tree' })
    const mode = screen.getByRole('group', { name: /^mode/i })
    const watch = within(mode).getByRole('radio', { name: /^watch$/i })
    const doIt = within(mode).getByRole('radio', { name: /^do it yourself$/i })
    expect(doIt).toBeChecked()
    expect(watch).not.toBeChecked()
    expect(screen.getByText('Insert 5 into an AVL tree')).toBeTruthy()
    fireEvent.click(watch)
    expect(onChange).toHaveBeenCalledWith('watch')
  })

  it('order in the bar: Show, then Mode, then the task', () => {
    renderSwitcher({ mode: { value: 'watch', onChange: vi.fn() }, task: 'Insert 5 into an AVL tree' })
    const s = show()
    const m = screen.getByRole('group', { name: /^mode/i })
    const t = screen.getByText('Insert 5 into an AVL tree')
    expect(s.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(m.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('no mode prop, no Mode group', () => {
    renderSwitcher()
    expect(screen.queryByRole('group', { name: /^mode/i })).toBeNull()
  })

  it('has no axe violations with and without mode', async () => {
    const a = renderSwitcher()
    expect(await axe(a.container)).toHaveNoViolations()
    a.unmount()
    const b = renderSwitcher({ mode: { value: 'do', onChange: vi.fn() }, task: 'Insert 5 into an AVL tree' })
    expect(await axe(b.container)).toHaveNoViolations()
  })
})

describe('D22 FR-LRN-02 the replay hosts the switcher from step defaults', () => {
  it('defaults: Diagram locked, Text ticked, Pseudocode off and its panel absent', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" representations={{ primary: 'animation', supporting: ['text'] }} />)
    expect(box(/diagram/i)).toBeChecked()
    expect(box(/diagram/i)).toBeDisabled()
    expect(box(/text/i)).toBeChecked()
    expect(box(/pseudocode/i)).not.toBeChecked()
    expect(panel()).toBeNull()
    expect(wholeTree()).not.toBeNull()
  })

  it('on demand: ticking Pseudocode shows the panel with the current line; unticking keeps the position', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" representations={{ primary: 'animation', supporting: [] }} />)
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: 'Step' }))
    fireEvent.click(box(/pseudocode/i))
    const p = panel()!
    expect(p).not.toBeNull()
    expect(within(p).getAllByRole('listitem').filter((li) => li.getAttribute('aria-current') === 'step')).toHaveLength(1)
    fireEvent.click(box(/pseudocode/i))
    expect(panel()).toBeNull()
    expect(counter()).toBe('Step 3 / 9')
  })

  it('floor never hidden: with Text and Pseudocode off the tree and caption stay, and the caption updates', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" representations={{ primary: 'animation', supporting: ['text', 'pseudocode'] }} />)
    fireEvent.click(box(/text/i))
    fireEvent.click(box(/pseudocode/i))
    expect(wholeTree()).toBeNull()
    expect(panel()).toBeNull()
    expect(screen.getByRole('region', { name: 'Tree' })).toBeTruthy()
    const before = caption().textContent
    fireEvent.click(screen.getByRole('button', { name: 'Step' }))
    expect(caption().textContent).not.toBe(before)
  })

  it('D22 Text off: unticking Text removes the whole-tree text and keeps the tree view Describe button', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" representations={{ primary: 'animation', supporting: ['text'] }} />)
    expect(wholeTree()).not.toBeNull()
    fireEvent.click(box(/text/i))
    expect(wholeTree()).toBeNull()
    expect(screen.getByRole('button', { name: /describe tree/i })).toBeTruthy()
  })

  it('a new operation resets the boxes to the defaults', () => {
    const reps = { primary: 'animation' as const, supporting: [] as Representation[] }
    const { rerender } = render(<ReplayPlayer operation={INSERT} label="Tree" representations={reps} />)
    fireEvent.click(box(/pseudocode/i))
    expect(box(/pseudocode/i)).toBeChecked()
    rerender(<ReplayPlayer operation={{ ...INSERT, key: 25 }} label="Tree" representations={reps} />)
    expect(box(/pseudocode/i)).not.toBeChecked()
    expect(panel()).toBeNull()
  })

  it('compatibility: no representations and no shown means no switcher and everything shown', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    expect(screen.queryByRole('group', { name: /^show/i })).toBeNull()
    expect(panel()).not.toBeNull()
    expect(wholeTree()).not.toBeNull()
    expect(caption()).toBeTruthy()
  })

  it('controlled by an outer host: shown={["diagram"]} renders no switcher, no panel and no whole-tree text', () => {
    render(<ReplayPlayer operation={INSERT} label="Tree" shown={['diagram']} />)
    expect(screen.queryByRole('group', { name: /^show/i })).toBeNull()
    expect(panel()).toBeNull()
    expect(wholeTree()).toBeNull()
    expect(screen.getByRole('region', { name: 'Tree' })).toBeTruthy()
  })
})
