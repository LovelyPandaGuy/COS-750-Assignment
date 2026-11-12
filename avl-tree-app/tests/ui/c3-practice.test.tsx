import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { insert } from '../../src/engine/bst'
import type { Key, Tree } from '../../src/engine/tree'
import { BalanceFactorFill } from '../../src/ui/module/practice/BalanceFactorFill'
import { SpotTheProblem } from '../../src/ui/module/practice/SpotTheProblem'
import { practiceModuleCopy as copy } from '../../src/content/modules/practice'

// Spec: add-modules-c2-c3 / module-c3-avl-property. LO3, FR-VIS-10, D27.
// Component contract (design.md decision 8): controlled answers, hints rendered from hintsUsed.

const bst = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
const node = (key: Key) => screen.getByRole('treeitem', { name: new RegExp(`^Node ${key}\\b`) })
const field = () => screen.getByRole('textbox', { name: /balance factor/i })
const status = () => screen.getByRole('status')

function Fill({ tree, onReview = () => {} }: { tree: Tree; onReview?: () => void }) {
  const [answered, setAnswered] = useState<Key[]>([])
  return (
    <BalanceFactorFill
      tree={tree}
      answered={answered}
      onAnswered={(k) => setAnswered((a) => [...a, k])}
      hintsUsed={0}
      onReview={onReview}
      onNewTree={() => {}}
    />
  )
}

function Spot({ tree }: { tree: Tree }) {
  const [solved, setSolved] = useState(false)
  return <SpotTheProblem tree={tree} solved={solved} onSolved={() => setSolved(true)} hintsUsed={0} onReview={() => {}} onNewTree={() => {}} />
}

function answer(key: Key, value: string) {
  fireEvent.click(node(key))
  fireEvent.change(field(), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: /^check$/i }))
}

describe('LO3 practice: fill in the balance factors', () => {
  it('correct answer is revealed on the tree', () => {
    const { container } = render(<Fill tree={bst([30, 20, 10])} />)
    answer(30, '+2')
    expect(status().textContent).toMatch(/^That's right/)
    expect(container.querySelector('[data-key="30"] .tree-metrics')).toHaveTextContent('h2 · bf +2')
    expect(container.querySelector('[data-key="20"] .tree-metrics')).toHaveTextContent('bf ?')
  })

  it('accepts typed values with or without a sign, and the − and + buttons', () => {
    render(<Fill tree={bst([30, 20, 10])} />)
    fireEvent.click(node(20))
    fireEvent.click(screen.getByRole('button', { name: copy.fillIn.increase }))
    expect(field()).toHaveValue('+1')
    fireEvent.click(screen.getByRole('button', { name: /^check$/i }))
    expect(status().textContent).toMatch(/^That's right/)
    answer(10, '0')
    expect(status().textContent).toMatch(/^That's right/)
  })

  it('all nodes done: says the tree is complete', () => {
    render(<Fill tree={bst([30, 20, 10])} />)
    answer(30, '2')
    answer(20, '1')
    answer(10, '0')
    expect(screen.getByText(copy.fillIn.complete)).toBeInTheDocument()
  })

  it('sign slip is named, with engine heights, Try again and Review', () => {
    let reviewed = 0
    render(<Fill tree={bst([30, 20, 10])} onReview={() => reviewed++} />)
    answer(30, '−2')
    const s = status()
    expect(s.textContent).toMatch(/^Not quite yet/)
    expect(s.textContent).toMatch(/other way round/i)
    expect(s.textContent).toContain('1')
    expect(s.textContent).toContain('−1')
    fireEvent.click(within(s).getByRole('button', { name: copy.review }))
    expect(reviewed).toBe(1)
    fireEvent.click(within(s).getByRole('button', { name: copy.tryAgain }))
    expect(document.activeElement).toBe(field())
  })

  it('keyboard only, polite live region, axe clean', async () => {
    const { container } = render(<Fill tree={bst([30, 20, 10])} />)
    const root = node(30)
    root.focus()
    fireEvent.keyDown(root, { key: 'Enter' })
    expect(field()).toHaveAccessibleName(/node 30/i)
    fireEvent.change(field(), { target: { value: '2' } })
    fireEvent.submit(field().closest('form')!)
    expect(status()).toHaveAttribute('aria-live', 'polite')
    expect(status().textContent).toMatch(/^That's right/)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('no balance factor or Unbalanced flag shows before an answer', () => {
    const { container } = render(<Fill tree={bst([30, 20, 10])} />)
    expect(container.querySelectorAll('.tree-flag')).toHaveLength(0)
    expect(container.querySelector('.tree-description')!.textContent).not.toMatch(/unbalanced/i)
  })
})

describe('LO3 practice: spot the problem', () => {
  it('correct node reveals the balance factors and the flag', () => {
    const { container } = render(<Spot tree={bst([50, 30, 70, 20, 80, 10])} />)
    expect(container.querySelectorAll('.tree-flag')).toHaveLength(0)
    fireEvent.click(node(30))
    fireEvent.click(screen.getByRole('button', { name: /^check$/i }))
    expect(status().textContent).toMatch(/^That's right/)
    expect(container.querySelector('[data-key="30"] .tree-flag')).toHaveTextContent('Unbalanced')
    expect(container.querySelector('[data-key="50"] .tree-metrics')).toHaveTextContent('bf +1')
  })

  it('another node is not yet, with Try again', () => {
    render(<Spot tree={bst([50, 30, 70, 20, 80, 10])} />)
    fireEvent.click(node(50))
    fireEvent.click(screen.getByRole('button', { name: /^check$/i }))
    expect(status().textContent).toMatch(/^Not quite yet/)
    expect(within(status()).getByRole('button', { name: copy.tryAgain })).toBeInTheDocument()
  })

  it('hints follow hintsUsed', () => {
    render(<SpotTheProblem tree={bst([50, 30, 70, 20, 80, 10])} solved={false} onSolved={() => {}} hintsUsed={2} onReview={() => {}} onNewTree={() => {}} />)
    expect(within(screen.getByRole('list', { name: copy.hintsLabel })).getAllByRole('listitem')).toHaveLength(2)
  })
})
