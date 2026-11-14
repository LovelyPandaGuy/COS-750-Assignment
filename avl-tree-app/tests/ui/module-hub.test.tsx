import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { MODULE_IDS } from '../../src/state/learnerState'
import { MODULE_TITLES, moduleLabel } from '../../src/content/modules'
import { screenCopy } from '../../src/content/screens'
import { LEARNER_KEY } from '../../src/state/storage'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-routing-and-screen-skeleton / module-hub and screen-skeletons. Requirement IDs: FR-LRN-03, FR-LRN-04, FR-LRN-05, FR-DIA-04, FR-DIA-05, FR-VIS-08, NFR-02.

const h1 = () => screen.getByRole('heading', { level: 1 })
const main = () => screen.getByRole('main')
const map = () => screen.getByRole('navigation', { name: /progress map/i })
const items = () => within(map()).getAllByRole('listitem')
const href = (el: HTMLElement) => el.getAttribute('href') ?? ''
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')

describe('FR-LRN-03 progress map', () => {
  it('return visit: nine modules in order with statuses from the state', () => {
    renderRoutes(backendWith(progressState()), '/path')
    const li = items().slice(0, 9)
    expect(li).toHaveLength(9)
    li.forEach((el, i) => expect(within(el).getByRole('link')).toHaveTextContent(moduleLabel(MODULE_IDS[i])))
    const words = ['Done', 'Done', 'Done', 'You are here', 'Up next', 'Later', 'Later', 'Later', 'Later']
    li.forEach((el, i) => expect(el.textContent, MODULE_IDS[i]).toContain(words[i]))
    expect(li.map((el) => el.getAttribute('data-status'))).toEqual([
      'done', 'done', 'done', 'current', 'next', 'later', 'later', 'later', 'later',
    ])
  })

  it('fresh learner: C1 here, C2 next', () => {
    renderRoutes(backendWith(), '/path')
    const li = items()
    expect(li[0].textContent).toContain('You are here')
    expect(li[1].textContent).toContain('Up next')
    expect(li[2].textContent).toContain('Later')
  })

  it('every item has a symbol and a word, and the stylesheet gives each status its own border', () => {
    renderRoutes(backendWith(progressState()), '/path')
    for (const el of items().slice(0, 9)) expect(el.textContent).toMatch(/[✓▶○]/)
    const css = strip(readFileSync('src/ui/screens.css', 'utf8'))
    const border = (status: string) => {
      const m = new RegExp(`\\[data-status=['"]${status}['"]\\][^{]*\\{([^}]*)\\}`).exec(css)
      expect(m, status).not.toBeNull()
      return (m![1].match(/border[^:]*:[^;]+/g) ?? []).join(';')
    }
    expect(new Set([border('done'), border('current'), border('later')]).size).toBe(3)
  })

  it('marks the current item and is a labelled navigation landmark', () => {
    renderRoutes(backendWith(progressState()), '/path')
    expect(items()[3]).toHaveAttribute('aria-current', 'step')
    expect(items().filter((el) => el.hasAttribute('aria-current'))).toHaveLength(1)
  })

  it('marks C7 optional and ends with a link to the readiness summary', () => {
    renderRoutes(backendWith(), '/path')
    expect(items()[6].textContent).toContain('Optional')
    const last = within(items()[items().length - 1]).getByRole('link')
    expect(href(last)).toMatch(/\/readiness$/)
  })

  it('locks nothing: every module link goes to its module screen', () => {
    renderRoutes(backendWith(), '/path')
    items().slice(0, 9).forEach((el, i) => {
      expect(href(within(el).getByRole('link'))).toMatch(new RegExp(`/module/${MODULE_IDS[i]}$`))
    })
  })

  it('shows only what the state says', () => {
    renderRoutes(backendWith(progressState({ currentModule: 'C5', completedModules: ['C1', 'C3', 'C4'] })), '/path')
    expect(items()[1].textContent).toContain('Later')
    expect(items()[1].textContent).not.toContain('Done')
  })
})

describe('FR-LRN-03 hub screen', () => {
  it('has the heading, the current module card with its link, and the sandbox card', () => {
    renderRoutes(backendWith(progressState()), '/path')
    expect(h1()).toHaveTextContent('Your path')
    const card = screen.getByRole('region', { name: 'C4 Search (the algorithm)' })
    expect(href(within(card).getByRole('link', { name: /^continue/i }))).toMatch(/\/module\/C4$/)
    expect(href(within(main()).getByRole('link', { name: /open sandbox/i }))).toMatch(/\/sandbox$/)
  })

  // Spec: add-sandbox / module-hub delta. FR-VIS-08, D11.
  it('suggests the sandbox once C2 is completed, and links to it either way', () => {
    const card = () => screen.getByRole('region', { name: screenCopy.hub.sandboxHeading })
    const { unmount } = renderRoutes(backendWith(progressState()), '/path')
    expect(card()).toHaveTextContent(screenCopy.hub.sandboxSuggested)
    expect(href(within(card()).getByRole('link', { name: /open sandbox/i }))).toMatch(/\/sandbox$/)
    unmount()
    renderRoutes(backendWith(), '/path')
    expect(card()).not.toHaveTextContent(screenCopy.hub.sandboxSuggested)
    expect(href(within(card()).getByRole('link', { name: /open sandbox/i }))).toMatch(/\/sandbox$/)
  })

  it('Continue opens the current module', () => {
    renderRoutes(backendWith(progressState()), '/path')
    fireEvent.click(within(main()).getByRole('link', { name: /^continue/i }))
    expect(h1()).toHaveTextContent('Search (the algorithm)')
  })

  it('has exactly one primary action', () => {
    renderRoutes(backendWith(progressState()), '/path')
    expect(main().querySelectorAll('.button-primary')).toHaveLength(1)
  })

  it('shows no scores, points, streaks or comparison', () => {
    renderRoutes(backendWith(progressState()), '/path')
    expect(main().textContent).not.toMatch(/\b(score|points|streak|rank|grade|pass|fail)\b/i)
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

  it('Back to path opens the hub', () => {
    renderRoutes(backendWith(), '/readiness')
    fireEvent.click(within(main()).getByRole('link', { name: /back to path/i }))
    expect(h1()).toHaveTextContent('Your path')
  })

  it('moving about does not change the stored learner state', () => {
    const backend = backendWith(progressState({ currentModule: 'C9' }))
    const before = backend.getItem(LEARNER_KEY)
    renderRoutes(backend, '/path')
    fireEvent.click(within(main()).getByRole('link', { name: /^continue/i }))
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
    for (const f of ['src/components/ProgressMap.tsx', 'src/components/ActivityList.tsx', 'src/pages/Hub.tsx', 'src/pages/Module.tsx']) {
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
