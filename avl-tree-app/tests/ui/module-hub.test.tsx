import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { MODULE_IDS } from '../../src/state/learnerState'
import { MODULE_TITLES } from '../../src/content/modules'
import { screenCopy } from '../../src/content/screens'
import { LEARNER_KEY } from '../../src/state/storage'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-routing-and-screen-skeleton / module-hub and screen-skeletons; remove-path-page (D159, D160). Requirement IDs: FR-LRN-03, FR-LRN-04, FR-LRN-05, FR-DIA-04, FR-DIA-05, FR-VIS-08, NFR-02.

const h1 = () => screen.getByRole('heading', { level: 1 })
const main = () => screen.getByRole('main')
const href = (el: HTMLElement) => el.getAttribute('href') ?? ''
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')

// remove-path-page (D159, D160): there is no path page; the Lessons sidebar shows the path (D155).
describe('remove-path-page: the path page is gone (D159)', () => {
  it('/path opens the current lesson', () => {
    renderRoutes(backendWith(progressState()), '/path')
    expect(h1()).toHaveTextContent('Search (the algorithm)')
    expect(screen.queryByText('Your path')).toBeNull()
  })

  it('no screen links to /path', () => {
    for (const path of ['/', '/module/C4', '/module/C1/refresher', '/sandbox', '/readiness']) {
      const { container, unmount } = renderRoutes(backendWith(progressState()), path)
      const links = [...container.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? '')
      expect(links.filter((h) => /\/path$/.test(h)), path).toEqual([])
      expect(container.textContent, path).not.toMatch(/back to path/i)
      unmount()
    }
  })

  it('no sandbox card or suggestion is left (D160)', () => {
    expect((screenCopy as Record<string, unknown>).hub).not.toHaveProperty('sandboxSuggested')
  })
})

describe('FR-LRN-05 module screen', () => {
  it('shows the lesson title as the heading of every module (ID 7.1)', () => {
    for (const id of MODULE_IDS) {
      const { unmount } = renderRoutes(backendWith(), `/module/${id}`)
      expect(h1(), id).toHaveTextContent(MODULE_TITLES[id])
      unmount()
    }
  })

  it('a lesson module plays the lesson, with no activity list', () => {
    renderRoutes(backendWith(), '/module/C5')
    expect(within(main()).getAllByRole('link').filter((a) => /\/module\/C5\//.test(href(a)))).toHaveLength(0)
    expect(within(main()).getByText('Lesson 5 of 9')).toBeInTheDocument()
  })

  it('C1 and C9 are lessons too, with no activity list (live-c1-and-c9)', () => {
    const a = renderRoutes(backendWith(), '/module/C1')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome')
    expect(screen.getByText('Lesson 1 of 9')).toBeInTheDocument()
    expect(within(main()).queryAllByRole('link').filter((l) => /\/module\/C1\/(check|refresher)$/.test(href(l)))).toHaveLength(0)
    a.unmount()
    renderRoutes(backendWith(), '/module/C9')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Am I ready for the lecture?')
    expect(screen.getByText('Lesson 9 of 9')).toBeInTheDocument()
  })

  it('Back to your lesson opens the current lesson (D159)', () => {
    renderRoutes(backendWith(progressState()), '/readiness')
    const back = within(main()).getByRole('link', { name: '← Back to C4 Search (the algorithm)' })
    expect(href(back)).toMatch(/\/module\/C4$/)
    fireEvent.click(back)
    expect(h1()).toHaveTextContent('Search (the algorithm)')
  })

  it('moving about does not change the stored learner state', () => {
    const backend = backendWith(progressState({ currentModule: 'C9' }))
    const before = backend.getItem(LEARNER_KEY)
    renderRoutes(backend, '/module/C9')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })
})

describe('FR-VIS-08 no skeleton screens are left', () => {
  it('visiting the C1, C9 and readiness screens leaves the stored state byte for byte the same', () => {
    const backend = backendWith(progressState())
    const before = backend.getItem(LEARNER_KEY)
    for (const path of ['/module/C1/check', '/module/C1/check/result', '/module/C1/refresher', '/module/C9/check', '/readiness']) renderRoutes(backend, path).unmount()
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })
})

describe('FR-DIA-05 wording and targets', () => {
  it('uses no mark, grade, pass, fail, test or score words in the screen wording', () => {
    expect(strip(readFileSync('src/content/screens.ts', 'utf8'))).not.toMatch(/\b(marks?|grades?|pass|fail\w*|tests?|scores?)\b/i)
  })

  it('imports visible strings from content', () => {
    for (const f of ['src/components/ProgressMap.tsx', 'src/components/ActivityList.tsx', 'src/components/BackToLesson.tsx', 'src/pages/Module.tsx']) {
      expect(readFileSync(f, 'utf8'), f).toMatch(/content\/(screens|modules)/)
    }
  })

  it('gives links and buttons a 44 px target and uses tokens only', () => {
    const css = strip(readFileSync('src/ui/screens.css', 'utf8'))
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
    for (const sel of ['.screen-link', '.progress-link']) {
      const bodies = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
        .filter((m) => m[1].split(',').some((s) => s.trim() === sel))
        .map((m) => m[2])
      expect(bodies.some((b) => /min-height:\s*var\(--target-min\)/.test(b)), sel).toBe(true)
    }
  })
})
