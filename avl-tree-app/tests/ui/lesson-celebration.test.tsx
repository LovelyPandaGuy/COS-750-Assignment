import { act, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { lessonById, loadContent } from '../../src/live/load'
import { lessonTitle } from '../../src/live/lessonTitle'
import type { Attempt } from '../../src/state/learnerState'
import { LearnerProvider, useLearner } from '../../src/state/LearnerContext'
import { createSettingsStorage, memoryBackend, SETTINGS_KEY } from '../../src/state/storage'
import { Celebration } from '../../src/ui/lesson/Confetti'
import { ThemeProvider } from '../../src/ui/ThemeContext'
import { boot, progressState, renderRoutes, backendWith } from './learner-fixtures'

// Spec: revamp-lesson-frame / lesson-celebration (D169; ID 10.4, ID 9.3, FR-MOT-04, quality bar 9);
// polish-sidebar-and-confetti (D173): side cannons from react-canvas-confetti, mocked here because jsdom has no canvas.

const fire = vi.fn()
vi.mock('react-canvas-confetti', () => ({
  default: function MockCanvasConfetti({ onInit }: { onInit?: (p: { confetti: typeof fire }) => void }) {
    useEffect(() => onInit?.({ confetti: fire }), [onInit])
    return <canvas data-testid="confetti-canvas" />
  },
}))

const content = loadContent().content!
const rewards = content.rewards as { titles: { title: string; message: string; minShare: number }[]; confetti: { durationMs: number } }
const att = (questionId: string, correct: boolean, attempt = 1): Attempt => ({ questionId, at: '2026-11-15T10:00:00.000Z', answer: null, correct, hintsUsed: 0, attempt })
const confetti = () => document.querySelector('.confetti')

let reduce = false
const realMatchMedia = window.matchMedia
beforeEach(() => {
  reduce = false
  window.matchMedia = (query: string) =>
    ({ matches: query.includes('prefers-reduced-motion: reduce') ? reduce : false, media: query, onchange: null, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false }) as MediaQueryList
})
afterEach(() => {
  window.matchMedia = realMatchMedia
  vi.useRealTimers()
})

/** The celebration in a learner and theme context, with a handle to complete a lesson. */
function mount(opts: { confetti?: boolean; completed?: string[] } = {}) {
  const settingsBackend = memoryBackend()
  if (opts.confetti === false) settingsBackend.setItem(SETTINGS_KEY, JSON.stringify({ theme: 'light', confetti: false, narration: false, textSize: 'normal' }))
  const booted = boot(backendWith(progressState({ completedModules: (opts.completed ?? ['C1', 'C2']) as never, currentModule: 'C3' })))
  let api: ReturnType<typeof useLearner> | null = null
  function Grab() {
    api = useLearner()
    return null
  }
  render(
    <ThemeProvider settings={createSettingsStorage(settingsBackend)} initial="light">
      <LearnerProvider storage={booted.storage} initial={booted.initial}>
        <Celebration />
        <Grab />
      </LearnerProvider>
    </ThemeProvider>,
  )
  return { complete: (id: string) => act(() => api!.completeModule(id as never)) }
}

describe('lesson-celebration: confetti when a lesson is completed (ID 10.4, D169)', () => {
  it('side cannons on completion: both bottom corners, token colours, reduced-motion aware; firing stops after the content duration; gone within 4 s', () => {
    vi.useFakeTimers()
    fire.mockClear()
    const root = document.documentElement.style
    root.setProperty('--action-primary', '#5B3FD6')
    root.setProperty('--node-balanced', '#0072B2')
    const m = mount()
    expect(confetti()).toBeNull()
    m.complete('C3')
    expect(confetti()).not.toBeNull()
    expect(confetti()).toHaveAttribute('aria-hidden', 'true')
    expect(confetti()!.querySelector('canvas')).not.toBeNull()
    act(() => void vi.advanceTimersByTime(200))
    const opts = fire.mock.calls.map((c) => c[0] as { origin: { x: number }; colors?: string[]; disableForReducedMotion?: boolean })
    expect(opts.some((o) => o.origin.x === 0)).toBe(true)
    expect(opts.some((o) => o.origin.x === 1)).toBe(true)
    for (const o of opts) {
      expect(o.disableForReducedMotion).toBe(true)
      expect(o.colors).toEqual(expect.arrayContaining(['#5B3FD6', '#0072B2']))
    }
    expect(rewards.confetti.durationMs).toBe(1500)
    act(() => void vi.advanceTimersByTime(rewards.confetti.durationMs))
    const after = fire.mock.calls.length
    act(() => void vi.advanceTimersByTime(500))
    expect(fire.mock.calls.length).toBe(after)
    act(() => void vi.advanceTimersByTime(4000 - rewards.confetti.durationMs - 700))
    expect(confetti()).toBeNull()
    root.removeProperty('--action-primary')
    root.removeProperty('--node-balanced')
  })

  it('not with the setting off', () => {
    const m = mount({ confetti: false })
    m.complete('C3')
    expect(confetti()).toBeNull()
  })

  it('not under reduced motion (quality bar 9)', () => {
    reduce = true
    const m = mount()
    m.complete('C3')
    expect(confetti()).toBeNull()
  })

  it('not for lessons completed before (only a new completion celebrates)', () => {
    mount({ completed: ['C1', 'C2', 'C3'] })
    expect(confetti()).toBeNull()
  })

  it('decorative: the canvas wrapper takes no pointer input and is fixed over the page', () => {
    const css = readFileSync('src/ui/lesson/confetti.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).toMatch(/\.confetti\s*\{[^}]*pointer-events:\s*none/)
    expect(css).toMatch(/\.confetti\s*\{[^}]*position:\s*fixed/)
  })

  it('a failing confetti never takes the page down (decorative only)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fire.mockImplementation(() => {
      throw new Error('canvas failed')
    })
    const m = mount()
    expect(() => m.complete('C3')).not.toThrow()
    expect(confetti()).toBeNull()
    fire.mockReset()
    spy.mockRestore()
  })

  it('uses react-canvas-confetti, pinned', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { dependencies: Record<string, string> }
    expect(pkg.dependencies['react-canvas-confetti']).toBe('2.0.7')
    expect(readFileSync('src/ui/lesson/Confetti.tsx', 'utf8')).toMatch(/from 'react-canvas-confetti'/)
  })

  it('the app mounts it for every route', () => {
    expect(readFileSync('src/App.tsx', 'utf8')).toMatch(/<Celebration\s*\/>/)
  })
})

describe('lesson-celebration: the lesson\'s title (ID 10.4, D169)', () => {
  const byTitle = (t: string) => rewards.titles.find((x) => x.title === t)!

  it('null until the check is finished', () => {
    expect(lessonTitle('chk3', [att('chk3-01', true)], content)).toBeNull()
    expect(lessonTitle('chk3', [att('chk3-01', true), att('chk3-02', false)], content)).toBeNull() // one attempt left
  })

  it('every criterion met: Structural Savant', () => {
    expect(lessonTitle('chk3', [att('chk3-01', true), att('chk3-02', true)], content)?.title).toBe('Structural Savant')
  })

  it('either attempt counts', () => {
    expect(lessonTitle('chk3', [att('chk3-01', true), att('chk3-02', false, 1), att('chk3-02', true, 2)], content)?.title).toBe('Structural Savant')
  })

  it('half met (both attempts used on the other): the highest band at or below one half', () => {
    const t = lessonTitle('chk3', [att('chk3-01', true), att('chk3-02', false, 1), att('chk3-02', false, 2)], content)
    expect(t?.title).toBe('BST Boss')
    expect(byTitle('BST Boss').minShare).toBe(0.5)
  })

  it('on the summary once the check is finished, with its message; not before', () => {
    const last = lessonById('c3')!.screens.at(-1)!
    const done = renderRoutes(backendWith(progressState({ attempts: [att('chk3-01', true), att('chk3-02', true)] })), '/module/C3')
    for (let i = 0; i < lessonById('c3')!.screens.length - 1; i++) act(() => screen.getByRole('button', { name: 'Next' }).click())
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(last.title)
    const panel = document.querySelector('.lesson-title-panel') as HTMLElement
    expect(panel).toHaveTextContent('Your title for this lesson')
    expect(panel).toHaveTextContent('Structural Savant')
    expect(panel).toHaveTextContent(byTitle('Structural Savant').message)
    expect(panel.textContent).not.toMatch(/\b(score|points|rank|grade|pass|fail)\b/i)
    done.unmount()
  })
})
