import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { avlInsert, avlInsertTrace } from '../../src/engine/avl'
import type { Key, Tree } from '../../src/engine/tree'
import { predictionFor } from '../../src/practice/predict'
import type { ModuleContent, Step } from '../../src/modules/schema'
import { playerCopy } from '../../src/content/modules/player'
import { practiceCopy } from '../../src/content/practice'
import { replayCopy } from '../../src/content/replay'
import { ModulePlayer } from '../../src/ui/module/ModulePlayer'

// Spec: add-insert-replay / module-framework delta. Requirement IDs: FR-VIS-03, FR-VIS-04, FR-VIS-05, FR-VIS-06, D27, D33.

const KEYS = [30, 20]
const INSERT = 10
const LABEL = `AVL tree from ${KEYS.join(', ')}`
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const TREE = avl(KEYS)
const N = avlInsertTrace(TREE, INSERT).trace.length

const insertStep = (id: string, heading: string, replay: NonNullable<Step['replay']>): Step => ({
  id,
  event: 'content',
  heading,
  primary: 'animation',
  figures: [{ id: 't', source: { kind: 'avl', keys: KEYS }, label: LABEL }],
  replay,
  text: () => [`Step text for ${heading}.`],
})
const plain = (id: string, heading: string): Step => ({ id, event: 'content', heading, primary: 'text', text: () => [heading] })

const FIXTURE: ModuleContent = {
  id: 'C6',
  steps: [
    plain('f-first', 'First step'),
    insertStep('f-watch', 'Watch an insert', { figure: 't', insert: INSERT }),
    insertStep('f-predict', 'Predict an insert', { figure: 't', insert: INSERT, predict: 'node' }),
    insertStep('f-diy', 'Do an insert yourself', { figure: 't', insert: INSERT, predict: 'node', doItYourself: true }),
    plain('f-last', 'Last step'),
  ],
}

const show = () => render(<MemoryRouter><ModulePlayer content={FIXTURE} activity="explore" /></MemoryRouter>)
const h2 = () => screen.getByRole('heading', { level: 2 })
const button = (name: string | RegExp) => screen.getByRole('button', { name })
// The replay has its own Back button, so the player's Next and Back are found in the step strip.
const strip = () => within(screen.getByRole('group', { name: playerCopy.stripLabel }))
const next = () => fireEvent.click(strip().getByRole('button', { name: playerCopy.next }))
const back = () => fireEvent.click(strip().getByRole('button', { name: playerCopy.back }))
function goTo(heading: string) {
  for (let i = 0; i < 10 && h2().textContent !== heading; i++) next()
  expect(h2()).toHaveTextContent(heading)
}
const counter = () => screen.getByText(/^Step \d+ \/ \d+$/).textContent
const stepReplay = (times: number) => {
  for (let i = 0; i < times; i++) fireEvent.click(button(replayCopy.controls.step))
}
const reveal = () => document.querySelector('.practice-reveal')
const lockIn = () => button(practiceCopy.predict.lockIn)
const choose30 = () => fireEvent.click(screen.getByRole('radio', { name: practiceCopy.predict.node(30) }))
/** The key of the node drawn highest: the root. Positions come from the tree layout transforms. */
function rootKey(): number {
  const nodes = [...document.querySelectorAll('[data-key]')].map((g) => ({
    key: Number(g.getAttribute('data-key')),
    y: Number(/translate\(\S+ (\S+)\)/.exec(g.getAttribute('transform') ?? '')?.[1]),
  }))
  return nodes.sort((a, b) => a.y - b.y)[0].key
}
const keysShown = () => [...document.querySelectorAll('[data-key]')].map((g) => Number(g.getAttribute('data-key'))).sort((a, b) => a - b)

afterEach(() => vi.restoreAllMocks())

describe('FR-VIS-03 FR-VIS-04 a step can play an insert', () => {
  it('shows the replay controls and the insert pseudocode at step 0 on the starting tree, once', () => {
    show()
    goTo('Watch an insert')
    expect(screen.getByRole('group', { name: replayCopy.controls.label })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: replayCopy.panel.title(replayCopy.panel.insert) })).toBeInTheDocument()
    expect(counter()).toBe(`Step 0 / ${N}`)
    expect(keysShown()).toEqual([20, 30])
    expect(screen.getAllByRole('region', { name: LABEL })).toHaveLength(1)
  })

  it('stepping to the end shows the engine AVL tree of 30, 20, 10 with root 20', () => {
    show()
    goTo('Watch an insert')
    stepReplay(N)
    expect(counter()).toBe(`Step ${N} / ${N}`)
    expect(keysShown()).toEqual([10, 20, 30])
    expect(rootKey()).toBe(20)
  })

  it('starts again at step 0 after Next then Back', () => {
    show()
    goTo('Watch an insert')
    stepReplay(2)
    expect(counter()).toBe(`Step 2 / ${N}`)
    next()
    back()
    expect(counter()).toBe(`Step 0 / ${N}`)
  })
})

describe('FR-VIS-05 D33 predict before the insert replay', () => {
  it('holds the replay until an answer: prompt shown, Play and Step unavailable', () => {
    show()
    goTo('Predict an insert')
    expect(screen.getByRole('heading', { level: 3, name: practiceCopy.predict.heading })).toBeInTheDocument()
    expect(button(replayCopy.controls.play)).toBeDisabled()
    expect(button(replayCopy.controls.step)).toBeDisabled()
    expect(lockIn()).toBeDisabled()
  })

  it('lock in, watch to the end, then the reveal compares with the engine answer in neutral words', () => {
    show()
    goTo('Predict an insert')
    choose30()
    fireEvent.click(lockIn())
    expect(button(replayCopy.controls.step)).not.toBeDisabled()
    stepReplay(N - 1)
    expect(reveal()).toBeNull()
    stepReplay(1)
    expect(reveal()).not.toBeNull()
    expect(reveal()!.textContent).not.toMatch(/\b(wrong|fail\w*)\b|✗/i)
  })

  it('"Replay that step" moves the replay to the step the engine names', () => {
    show()
    goTo('Predict an insert')
    choose30()
    fireEvent.click(lockIn())
    stepReplay(N)
    const q = predictionFor(TREE, INSERT, 'node')
    expect(q.stepIndex).not.toBeNull()
    fireEvent.click(button(practiceCopy.reveal.replayStep))
    expect(counter()).toBe(`Step ${q.stepIndex! + 1} / ${N}`)
  })

  it('skip makes the replay available, shows no reveal and stores nothing', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    show()
    goTo('Predict an insert')
    fireEvent.click(button(practiceCopy.predict.skip))
    expect(button(replayCopy.controls.step)).not.toBeDisabled()
    stepReplay(N)
    expect(reveal()).toBeNull()
    expect(setItem).not.toHaveBeenCalled()
  })

  it('a prediction is never stored', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    show()
    goTo('Predict an insert')
    choose30()
    fireEvent.click(lockIn())
    stepReplay(N)
    expect(setItem).not.toHaveBeenCalled()
  })

  it('is fresh after Next then Back: the prompt shows again with nothing chosen', () => {
    show()
    goTo('Predict an insert')
    choose30()
    fireEvent.click(lockIn())
    next()
    back()
    expect(screen.getByRole('heading', { level: 3, name: practiceCopy.predict.heading })).toBeInTheDocument()
    expect(lockIn()).toBeDisabled()
    expect(screen.queryAllByRole('radio').filter((r) => (r as HTMLInputElement).checked)).toHaveLength(0)
  })
})

describe('FR-VIS-06 Watch or Do it yourself on an insert step', () => {
  const modeRadio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement

  it('Watch is selected first with the prompt and replay; Do it yourself shows the rotation tool instead', () => {
    show()
    goTo('Do an insert yourself')
    expect(modeRadio(practiceCopy.mode.watch).checked).toBe(true)
    expect(screen.getByRole('heading', { level: 3, name: practiceCopy.predict.heading })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: replayCopy.controls.label })).toBeInTheDocument()
    fireEvent.click(modeRadio(practiceCopy.mode.doIt))
    expect(screen.getByRole('heading', { level: 3, name: practiceCopy.practice.heading })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: replayCopy.controls.label })).toBeNull()
  })
})

describe('NFR-02 axe on insert steps', () => {
  it('watch, predict and Do it yourself steps are axe clean', async () => {
    const { container } = show()
    goTo('Watch an insert')
    expect(await axe(container), 'watch').toHaveNoViolations()
    goTo('Predict an insert')
    expect(await axe(container), 'predict').toHaveNoViolations()
    choose30()
    fireEvent.click(lockIn())
    stepReplay(N)
    expect(await axe(container), 'reveal').toHaveNoViolations()
    goTo('Do an insert yourself')
    expect(await axe(container), 'switch, watch').toHaveNoViolations()
    fireEvent.click(screen.getByRole('radio', { name: practiceCopy.mode.doIt }))
    expect(await axe(container), 'switch, do it yourself').toHaveNoViolations()
  }, 60_000)
})
