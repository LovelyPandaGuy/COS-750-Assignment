import { act, fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { MODULE_IDS } from '../../src/state/learnerState'
import { MODULE_TITLES, moduleLabel } from '../../src/content/modules'
import { startCopy } from '../../src/content/start'
import { useLearner } from '../../src/state/LearnerContext'
import {
  backendWith,
  controllableBackend,
  progressState,
  renderRoutes,
  throwingBackend,
} from './learner-fixtures'

// Spec: openspec/changes/add-learner-storage-ui/specs/start-screen/spec.md

const startButton = () => screen.queryByRole('button', { name: startCopy.startButton })
const resumeCard = () => screen.queryByRole('region', { name: startCopy.resumeHeading })
const resetLink = () => screen.queryByRole('button', { name: startCopy.resetLink })
const h1 = () => screen.getByRole('heading', { level: 1 })

function expectFirstVisit() {
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(h1()).toHaveTextContent(startCopy.heading)
  expect(startButton()).toBeInTheDocument()
  expect(resumeCard()).toBeNull()
  expect(resetLink()).toBeNull()
}

describe('FR-ONB-01 no sign-in', () => {
  const noCredentialFields = (root: HTMLElement) => {
    expect(root.querySelector('input[type=password], input[type=email]')).toBeNull()
    for (const el of root.querySelectorAll('input, textarea, select')) {
      const label = (el.getAttribute('aria-label') ?? '') + ((el as HTMLInputElement).labels?.[0]?.textContent ?? '')
      expect(label).not.toMatch(/password|e-?mail|student number|log ?in/i)
    }
  }

  it('has no credential field on first visit, return visit or module placeholder', () => {
    noCredentialFields(renderRoutes(backendWith()).container)
    noCredentialFields(renderRoutes(backendWith(progressState())).container)
    noCredentialFields(renderRoutes(backendWith(), '/module/C1').container)
  })
})

describe('FR-ONB-02 first visit', () => {
  it('fresh learner sees the first-visit layout', () => {
    renderRoutes(backendWith())
    expectFirstVisit()
  })

  it('a restored state with no progress sees the first-visit layout', () => {
    renderRoutes(backendWith(progressState({ currentModule: 'C1', completedModules: [], attempts: [] })))
    expectFirstVisit()
  })
})

describe('NFR-01 Start reaches C1 in one step', () => {
  it('Start opens module C1', () => {
    renderRoutes(backendWith())
    fireEvent.click(startButton()!)
    expect(h1()).toHaveTextContent(moduleLabel('C1'))
  })

  it('Start is a native button, so Enter and Space activate it as a click', () => {
    renderRoutes(backendWith())
    const b = startButton()!
    expect(b.tagName).toBe('BUTTON')
    expect(b).toHaveAttribute('type', 'button')
  })
})

describe('FR-ONB-03 resume on return', () => {
  it('return visit shows the ResumeCard naming C4 and hides Start', () => {
    renderRoutes(backendWith(progressState()))
    const card = resumeCard()!
    expect(card).toHaveTextContent('C4')
    expect(card).toHaveTextContent(MODULE_TITLES.C4)
    expect(startButton()).toBeNull()
    expect(resetLink()).toBeInTheDocument()
  })

  it('Resume opens the current module', () => {
    renderRoutes(backendWith(progressState()))
    fireEvent.click(within(resumeCard()!).getByRole('button', { name: startCopy.resumeButton }))
    expect(h1()).toHaveTextContent(moduleLabel('C4'))
  })
})

describe('D1 module screen placeholder', () => {
  it.each(MODULE_IDS)('module %s shows its D1 title as the heading', (id) => {
    renderRoutes(backendWith(), `/module/${id}`)
    expect(h1()).toHaveTextContent(moduleLabel(id))
    expect(h1()).toHaveTextContent(MODULE_TITLES[id])
  })

  it('an unknown module goes to the Start screen', () => {
    renderRoutes(backendWith(), '/module/C10')
    expect(h1()).toHaveTextContent(startCopy.heading)
  })
})

describe('NFR-06 message when stored data was replaced', () => {
  it('corrupt data: no throw, first-visit layout and the started-fresh message in a polite live region', () => {
    expect(() => renderRoutes(backendWith('{not json'))).not.toThrow()
    expectFirstVisit()
    const live = screen.getByRole('status')
    expect(live).toHaveTextContent(startCopy.startedFresh)
    expect(live).not.toHaveAttribute('aria-live', 'assertive')
  })

  it('wording avoids error, fail, corrupt and invalid; styles avoid not-yet tokens and raw colours', () => {
    for (const m of [startCopy.startedFresh, startCopy.notSaved, startCopy.resetDone]) {
      expect(m.length).toBeGreaterThan(0)
      expect(m).not.toMatch(/error|fail|corrupt|invalid/i)
    }
    const css = readFileSync('src/ui/start.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).not.toMatch(/--feedback-notyet|--mastery-notyet/)
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
  })

  it('no started-fresh message on a normal start', () => {
    renderRoutes(backendWith()).unmount()
    renderRoutes(backendWith(progressState()))
    expect(screen.queryByText(startCopy.startedFresh)).toBeNull()
  })

  it('carries an icon and words, not colour alone', () => {
    renderRoutes(backendWith('{not json'))
    const line = screen.getByText(startCopy.startedFresh).closest('.storage-notice-line')!
    expect(line.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })
})

describe('NFR-06 message when progress is not saved', () => {
  it('storage blocked: message, not-saved pill, no throw', () => {
    expect(() => renderRoutes(throwingBackend())).not.toThrow()
    expect(screen.getByRole('status')).toHaveTextContent(startCopy.notSaved)
    expect(screen.getByRole('banner')).toHaveTextContent(startCopy.notSavedPill)
  })

  it('storage working: saved pill on Start and on a module screen, no message', () => {
    renderRoutes(backendWith()).unmount()
    // Start screen
    renderRoutes(backendWith())
    expect(screen.getByRole('banner')).toHaveTextContent(startCopy.savedPill)
    expect(screen.queryByText(startCopy.notSaved)).toBeNull()
    fireEvent.click(startButton()!)
    expect(screen.getByRole('banner')).toHaveTextContent(startCopy.savedPill)
  })

  it('storage fills during the session: pill and message switch', () => {
    let api: ReturnType<typeof useLearner> | null = null
    function Grab() {
      api = useLearner()
      return null
    }
    const c = controllableBackend(backendWith(progressState()))
    renderRoutes(c.backend, '/', <Grab />)
    expect(screen.getByRole('banner')).toHaveTextContent(startCopy.savedPill)
    c.control.failWrites = true
    act(() => api!.reset())
    expect(screen.getByRole('banner')).toHaveTextContent(startCopy.notSavedPill)
    expect(screen.getByRole('status')).toHaveTextContent(startCopy.notSaved)
  })
})

describe('CLAUDE.md copy comes from content', () => {
  const sources = [
    'src/pages/Start.tsx',
    'src/pages/ModulePlaceholder.tsx',
    'src/components/ResumeCard.tsx',
    'src/components/ConfirmDialog.tsx',
    'src/components/StorageNotice.tsx',
  ]
  it.each(sources)('%s has no literal visible strings', (p) => {
    const text = readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
    expect(text, 'JSX text').not.toMatch(/>[^<>{}\n]*[A-Za-z]{2,}[^<>{}\n]*<\//)
    expect(text, 'labels').not.toMatch(/\b(aria-label|title|placeholder|alt)="[^"]*[A-Za-z]/)
  })

  it('has one D1 title for each of C1 to C9', () => {
    expect(Object.keys(MODULE_TITLES).sort()).toEqual([...MODULE_IDS])
    expect(MODULE_TITLES).toEqual({
      C1: 'Getting started and readiness check',
      C2: 'When BSTs go lopsided',
      C3: 'The AVL property',
      C4: 'Search',
      C5: 'Rotations',
      C6: 'Insertion with rebalancing',
      C7: 'Deletion',
      C8: 'Choosing a structure',
      C9: 'Am I ready',
    })
  })
})

describe('NFR-02 accessible Start screen', () => {
  it('first visit, return visit, started-fresh and not-saved states have no axe violations', async () => {
    for (const backend of [backendWith(), backendWith(progressState()), backendWith('{not json'), throwingBackend()]) {
      const { container, unmount } = renderRoutes(backend)
      expect(await axe(container)).toHaveNoViolations()
      unmount()
    }
  })

  it('Start and Resume have 44 px targets', () => {
    const css = readFileSync('src/ui/start.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    // Every rule naming the selector (alone or in a group); one of them must set the target.
    const bodies = (sel: string) =>
      [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
        .filter((m) => m[1].split(',').some((s) => s.trim() === sel))
        .map((m) => m[2])
    for (const sel of ['.button-primary', '.button-secondary', '.link-button']) {
      expect(bodies(sel).some((b) => /min-height:\s*var\(--target-min\)/.test(b)), sel).toBe(true)
    }
    renderRoutes(backendWith())
    expect(startButton()).toHaveClass('button-primary')
  })
})

// Review findings (task 5.2): moving to a module and a mid-session save failure must
// reach screen-reader users.
describe('NFR-02 focus moves to the module heading', () => {
  it('Start moves focus to the C1 heading', () => {
    renderRoutes(backendWith())
    fireEvent.click(startButton()!)
    expect(h1()).toHaveTextContent(moduleLabel('C1'))
    expect(h1()).toHaveFocus()
  })

  it('Resume moves focus to the current module heading', () => {
    renderRoutes(backendWith(progressState()))
    fireEvent.click(within(resumeCard()!).getByRole('button', { name: startCopy.resumeButton }))
    expect(h1()).toHaveTextContent(moduleLabel('C4'))
    expect(h1()).toHaveFocus()
  })

  it('opening a module URL directly leaves focus alone', () => {
    renderRoutes(backendWith(), '/module/C2')
    expect(h1()).not.toHaveFocus()
  })
})

describe('NFR-06 the saved pill is announced when it changes', () => {
  it('the pill is a polite live region on Start and on a module screen', () => {
    const { unmount } = renderRoutes(backendWith())
    const pill = () => screen.getByRole('banner').querySelector('.topbar-status')
    expect(pill()).toHaveAttribute('aria-live', 'polite')
    unmount()
    renderRoutes(backendWith(), '/module/C3')
    expect(pill()).toHaveAttribute('aria-live', 'polite')
    expect(pill()).toHaveTextContent(startCopy.savedPill)
  })
})
