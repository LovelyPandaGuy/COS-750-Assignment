import { render, screen, fireEvent, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { avlInsertTrace } from '../../src/engine/avl'
import { makeNode, type Key } from '../../src/engine/tree'
import { PredictionReveal } from '../../src/ui/practice/PredictionReveal'
import { PredictPrompt } from '../../src/ui/practice/PredictPrompt'

// Spec: add-predict-and-do-it-yourself / predict-first. Requirement IDs: FR-VIS-05, NFR-02, FR-VIS-10.

const leaf = (k: Key) => makeNode(k, null, null)
const T1 = makeNode(30, leaf(20), null)
const T2 = makeNode(30, leaf(10), null)
const T3 = makeNode(40, makeNode(20, leaf(10), null), leaf(60))
const BAL = makeNode(20, leaf(10), leaf(30))

const radio = (re: RegExp) => screen.getByRole('radio', { name: re })
const lock = () => screen.getByRole('button', { name: /lock in & watch/i })
const skip = () => screen.getByRole('button', { name: /skip, just watch/i })
const item = (k: Key) => screen.getByRole('treeitem', { name: new RegExp(`^Node ${k}\\b`) })

describe('FR-VIS-05 prompt before a replay', () => {
  it('states the key and offers the options as radios, with Lock in disabled until a choice', () => {
    render(<PredictPrompt tree={T1} keyToInsert={10} kind="node" onProceed={() => {}} />)
    expect(screen.getByText(/10/, { selector: ':not(svg *)' })).toBeTruthy()
    expect(screen.getAllByRole('radio').map((r) => r.getAttribute('type'))).toEqual(['radio', 'radio', 'radio'])
    expect(radio(/\b30\b/)).not.toBeChecked()
    expect(radio(/none/i)).toBeTruthy()
    expect(lock()).toBeDisabled()
    expect(skip()).toBeEnabled()
  })

  it('offers the cases for the case prediction', () => {
    render(<PredictPrompt tree={T1} keyToInsert={10} kind="case" onProceed={() => {}} />)
    for (const c of ['LL', 'RR', 'LR', 'RL']) expect(radio(new RegExp(`^${c}\\b`))).toBeTruthy()
    expect(radio(/none/i)).toBeTruthy()
  })

  it('lock in reports the prediction once', () => {
    const onProceed = vi.fn()
    render(<PredictPrompt tree={T1} keyToInsert={10} kind="node" onProceed={onProceed} />)
    fireEvent.click(radio(/\b20\b/))
    expect(lock()).toBeEnabled()
    fireEvent.click(lock())
    expect(onProceed).toHaveBeenCalledTimes(1)
    expect(onProceed).toHaveBeenCalledWith({ kind: 'node', choice: 20, answer: 30, skipped: false })
  })

  it('skip reports a skipped prediction, with or without a choice', () => {
    const a = vi.fn()
    const { unmount } = render(<PredictPrompt tree={T1} keyToInsert={10} kind="node" onProceed={a} />)
    fireEvent.click(skip())
    expect(a).toHaveBeenCalledWith({ kind: 'node', choice: null, answer: 30, skipped: true })
    unmount()
    const b = vi.fn()
    render(<PredictPrompt tree={T1} keyToInsert={10} kind="node" onProceed={b} />)
    fireEvent.click(radio(/\b20\b/))
    fireEvent.click(skip())
    expect(b).toHaveBeenCalledWith({ kind: 'node', choice: null, answer: 30, skipped: true })
  })

  it('does not proceed before an answer', () => {
    const onProceed = vi.fn()
    render(<PredictPrompt tree={T1} keyToInsert={10} kind="node" onProceed={onProceed} />)
    fireEvent.click(radio(/\b20\b/))
    expect(onProceed).not.toHaveBeenCalled()
  })

  it('choosing in the tree chooses the option, or shows "Your pick" for another node', () => {
    render(<PredictPrompt tree={T3} keyToInsert={5} kind="node" onProceed={() => {}} />)
    fireEvent.click(item(20))
    expect(radio(/\b20\b/)).toBeChecked()
    fireEvent.click(item(60))
    expect(screen.getByText(/your pick: node 60/i)).toBeTruthy()
    expect(lock()).toBeEnabled()
  })

  it('reports an off-path tree pick as the choice', () => {
    const onProceed = vi.fn()
    render(<PredictPrompt tree={T3} keyToInsert={5} kind="node" onProceed={onProceed} />)
    fireEvent.click(item(60))
    fireEvent.click(lock())
    expect(onProceed).toHaveBeenCalledWith({ kind: 'node', choice: 60, answer: 20, skipped: false })
  })

  it('starts with nothing chosen each time it is shown', () => {
    const { rerender } = render(<PredictPrompt key="a" tree={T1} keyToInsert={10} kind="node" onProceed={() => {}} />)
    fireEvent.click(radio(/\b20\b/))
    rerender(<PredictPrompt key="b" tree={T1} keyToInsert={10} kind="node" onProceed={() => {}} />)
    for (const r of screen.getAllByRole('radio')) expect(r).not.toBeChecked()
  })

  it('announces a lock-in in a polite status region, naming the choice', () => {
    render(<PredictPrompt tree={T1} keyToInsert={10} kind="node" onProceed={() => {}} />)
    fireEvent.click(radio(/\b20\b/))
    fireEvent.click(lock())
    expect(screen.getByRole('status')).toHaveTextContent(/locked in.*20/i)
  })

  it('has no axe violations and uses native controls', async () => {
    const { container } = render(<PredictPrompt tree={T1} keyToInsert={10} kind="node" onProceed={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
    expect(lock().tagName).toBe('BUTTON')
    expect(skip().tagName).toBe('BUTTON')
    expect(screen.getByRole('radio', { name: /none/i }).tagName).toBe('INPUT')
  })
})

describe('FR-VIS-05 reveal after the replay', () => {
  const reveal = (tree: typeof T1, key: Key, kind: 'node' | 'case' | 'root', choice: number | string, onReplayStep = vi.fn()) => {
    render(<PredictionReveal tree={tree} keyToInsert={key} kind={kind} choice={choice as never} onReplayStep={onReplayStep} />)
    return screen.getByRole('status')
  }

  it('match: says it matches and names the step number', () => {
    const step = avlInsertTrace(T1, 10).trace.findIndex((s) => s.kind === 'imbalance')
    const text = reveal(T1, 10, 'node', 30).textContent!
    expect(text).toMatch(/match/i)
    expect(text).toMatch(new RegExp(`step ${step + 1}\\b`, 'i'))
    expect(text).not.toMatch(/wrong|incorrect|fail/i)
  })

  it('mismatch, predicted node in range: gives both balance factors', () => {
    const text = reveal(T1, 10, 'node', 20).textContent!
    expect(text).toMatch(/20/)
    expect(text).toMatch(/\+1/)
    expect(text).toMatch(/30/)
    expect(text).toMatch(/\+2/)
  })

  it('mismatch, predicted node also out of balance but higher', () => {
    const text = reveal(T3, 5, 'node', 40).textContent!
    expect(text).toMatch(/40/)
    expect(text).toMatch(/\+2/)
    expect(text).toMatch(/20/)
    expect(text).toMatch(/lower|first/i)
  })

  it('predicted none but one is unbalanced', () => {
    const text = reveal(T1, 10, 'node', 'none').textContent!
    expect(text).toMatch(/30/)
    expect(text).toMatch(/\+2/)
  })

  it('predicted a node but none is unbalanced', () => {
    const text = reveal(BAL, 5, 'node', 10).textContent!
    expect(text).toMatch(/−1|-1/)
    expect(text).toMatch(/\+1/)
    expect(text).toMatch(/10/)
  })

  it('case mismatch says which way z and its taller child lean', () => {
    const text = reveal(T2, 20, 'case', 'LL').textContent!
    expect(text).toMatch(/30/)
    expect(text).toMatch(/10/)
    expect(text).toMatch(/left/i)
    expect(text).toMatch(/right/i)
    expect(text).toMatch(/LR/)
  })

  it('new root mismatch names the node lifted to the top', () => {
    expect(reveal(T2, 20, 'root', 10).textContent!).toMatch(/20/)
  })

  it('"Replay that step" calls back with the imbalance step index', () => {
    const onReplayStep = vi.fn()
    reveal(T1, 10, 'node', 30, onReplayStep)
    fireEvent.click(screen.getByRole('button', { name: /replay that step/i }))
    expect(onReplayStep).toHaveBeenCalledWith(avlInsertTrace(T1, 10).trace.findIndex((s) => s.kind === 'imbalance'))
  })

  it('match and mismatch start with different words or icons', () => {
    const { unmount } = render(<PredictionReveal tree={T1} keyToInsert={10} kind="node" choice={30} onReplayStep={() => {}} />)
    const a = screen.getByRole('status').textContent!.trim().split(/\s+/)[0]
    unmount()
    render(<PredictionReveal tree={T1} keyToInsert={10} kind="node" choice={20} onReplayStep={() => {}} />)
    const b = screen.getByRole('status').textContent!.trim().split(/\s+/)[0]
    expect(a).not.toBe(b)
  })

  it('uses "not quite yet" wording for a mismatch, with no marks', () => {
    const text = reveal(T1, 10, 'node', 20).textContent!
    expect(text).toMatch(/not quite yet/i)
    expect(text).not.toMatch(/wrong|incorrect|fail|score/i)
  })

  it('has no axe violations', async () => {
    const { container } = render(<PredictionReveal tree={T1} keyToInsert={10} kind="node" choice={20} onReplayStep={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders nothing for a skipped prediction', () => {
    const { container } = render(<PredictionReveal tree={T1} keyToInsert={10} kind="node" choice={null} onReplayStep={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('FR-VIS-05 predictions are practice, never marks', () => {
  const comments = (s: string) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')

  it('has no wrong, incorrect, fail or score in the wording', () => {
    expect(comments(readFileSync('src/content/practice.ts', 'utf8'))).not.toMatch(/\b(wrong|incorrect|fail\w*|score\w*)\b/i)
  })

  it('reports the prediction through the callback and stores nothing', () => {
    const before = localStorage.length
    const onProceed = vi.fn()
    render(<PredictPrompt tree={T1} keyToInsert={10} kind="node" onProceed={onProceed} />)
    fireEvent.click(radio(/\b20\b/))
    fireEvent.click(lock())
    expect(onProceed).toHaveBeenCalledWith(expect.objectContaining({ kind: 'node', choice: 20, answer: 30, skipped: false }))
    expect(localStorage.length).toBe(before)
  })

  it('keeps the prompt in a labelled group, before the buttons', () => {
    render(<PredictPrompt tree={T1} keyToInsert={10} kind="node" onProceed={() => {}} />)
    const group = screen.getByRole('group')
    expect(within(group).getAllByRole('radio').length).toBeGreaterThan(0)
  })
})

describe('NFR-02 targets', () => {
  it('gives prompt buttons and options a 44 px target in the stylesheet', () => {
    const css = readFileSync('src/ui/practice/practice.css', 'utf8')
    expect(css).toMatch(/\.practice-button[^{]*\{[^}]*min-height:\s*var\(--target-min\)/)
    expect(css).toMatch(/\.practice-option[^{]*\{[^}]*min-height:\s*var\(--target-min\)/)
  })
})
