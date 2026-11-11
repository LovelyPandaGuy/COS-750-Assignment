import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { MODULE_IDS } from '../../src/state/learnerState'
import { moduleLabel } from '../../src/content/modules'
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
  it('has the heading, the current module card with activities, and the sandbox card', () => {
    renderRoutes(backendWith(progressState()), '/path')
    expect(h1()).toHaveTextContent('Your path')
    const card = screen.getByRole('region', { name: 'C4 Search' })
    for (const [name, path] of [['Explore', 'explore'], ['Worked example', 'example'], ['Check', 'check']]) {
      expect(href(within(card).getByRole('link', { name: new RegExp(`^${name}`) }))).toMatch(new RegExp(`/module/C4/${path}$`))
    }
    expect(href(within(main()).getByRole('link', { name: /open sandbox/i }))).toMatch(/\/sandbox$/)
  })

  it('Continue opens the current module', () => {
    renderRoutes(backendWith(progressState()), '/path')
    fireEvent.click(within(main()).getByRole('link', { name: /^continue/i }))
    expect(h1()).toHaveTextContent('C4 Search')
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
  it('shows the D1 heading for every module', () => {
    for (const id of MODULE_IDS) {
      const { unmount } = renderRoutes(backendWith(), `/module/${id}`)
      expect(h1(), id).toHaveTextContent(moduleLabel(id))
      unmount()
    }
  })

  it('lists activities in default order with their place', () => {
    renderRoutes(backendWith(), '/module/C5')
    const links = within(main()).getAllByRole('link').filter((a) => /\/module\/C5\//.test(href(a)))
    expect(links.map((a) => href(a).replace(/^.*\/module\/C5\//, ''))).toEqual(['explore', 'example', 'check'])
    expect(links[0]).toHaveTextContent('1 of 3')
    expect(links[2]).toHaveTextContent('3 of 3')
    expect(links.map((a) => a.textContent!.split(/[·(]/)[0].trim())).toEqual(['Explore', 'Worked example', 'Check'])
  })

  it('C1 and C9 have their own activities', () => {
    renderRoutes(backendWith(), '/module/C1')
    const c1 = within(main()).getAllByRole('link').filter((a) => /\/module\/C1\//.test(href(a)))
    expect(c1.map((a) => href(a).replace(/^.*\/module\/C1\//, ''))).toEqual(['check', 'refresher'])
    expect(c1[0]).toHaveTextContent('Warm-up check')
    expect(c1[1]).toHaveTextContent('BST refresher')
    renderRoutes(backendWith(), '/module/C9')
    const c9 = within(screen.getAllByRole('main')[1]).getAllByRole('link').filter((a) => /\/module\/C9\//.test(href(a)))
    expect(c9).toHaveLength(1)
  })

  it('Back to path opens the hub', () => {
    renderRoutes(backendWith(), '/module/C4')
    fireEvent.click(within(main()).getByRole('link', { name: /back to path/i }))
    expect(h1()).toHaveTextContent('Your path')
  })

  it('moving about does not change the stored learner state', () => {
    const backend = backendWith(progressState())
    const before = backend.getItem(LEARNER_KEY)
    renderRoutes(backend, '/path')
    fireEvent.click(within(main()).getByRole('link', { name: /^continue/i }))
    fireEvent.click(within(main()).getByRole('link', { name: /^explore/i }))
    fireEvent.click(within(main()).getByRole('link', { name: /back to path/i }))
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })
})

describe('FR-VIS-08 skeleton screens', () => {
  const cases: [string, string][] = [
    ['/module/C1/check', 'Warm-up check'],
    ['/module/C1/check/result', "Here's where you're starting from"],
    ['/module/C1/refresher', 'BST refresher'],
    ['/module/C5/explore', 'Explore'],
    ['/module/C5/example', 'Worked example'],
    ['/module/C5/check', 'Check'],
    ['/module/C9/check', 'Check'],
    ['/sandbox', 'Sandbox'],
    ['/readiness', 'Ready for the lecture?'],
  ]

  it('has the heading and one "coming" line, with no content', () => {
    for (const [path, heading] of cases) {
      const { unmount } = renderRoutes(backendWith(), path)
      expect(h1(), path).toHaveTextContent(new RegExp(`^${heading.replace(/[?']/g, '.')}$`))
      expect(main().querySelectorAll('p'), path).toHaveLength(1)
      expect(main().querySelector('.tree-view, input, textarea, select, svg'), path).toBeNull()
      unmount()
    }
  })

  it('names the right module for an activity', () => {
    renderRoutes(backendWith(), '/module/C6/check')
    expect(screen.getByRole('banner').querySelector('.topbar-breadcrumb')).toHaveTextContent('C6 Insertion with rebalancing')
  })

  it('every skeleton links back to the path', () => {
    for (const [path] of cases) {
      const { unmount } = renderRoutes(backendWith(), path)
      const back = within(main()).getByRole('link', { name: /back to path/i })
      expect(href(back), path).toMatch(/\/path$/)
      unmount()
    }
    renderRoutes(backendWith(), '/sandbox')
    expect(within(main()).getByRole('link', { name: /back to path/i })).toHaveTextContent('←')
  })

  it('the result links to the refresher and the warm-up check, whatever the state', () => {
    for (const backend of [backendWith(), backendWith(progressState())]) {
      const { unmount } = renderRoutes(backend, '/module/C1/check/result')
      expect(href(within(main()).getByRole('link', { name: /bst refresher/i }))).toMatch(/\/module\/C1\/refresher$/)
      expect(href(within(main()).getByRole('link', { name: /warm-up check/i }))).toMatch(/\/module\/C1\/check$/)
      unmount()
    }
  })

  it('visiting every screen leaves the stored state byte for byte the same', () => {
    const backend = backendWith(progressState())
    const before = backend.getItem(LEARNER_KEY)
    for (const [path] of cases) renderRoutes(backend, path).unmount()
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })

  it('keeps the back link reachable by keyboard and has no axe violations', async () => {
    for (const [path] of cases) {
      const { container, unmount } = renderRoutes(backendWith(), path)
      expect(within(main()).getByRole('link', { name: /back to path/i }).getAttribute('tabindex')).not.toBe('-1')
      expect(await axe(container), path).toHaveNoViolations()
      unmount()
    }
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
