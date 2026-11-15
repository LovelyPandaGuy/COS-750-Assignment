import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { lessonCopy } from '../../src/content/lesson'
import { moduleLabel } from '../../src/content/modules'
import { shellCopy } from '../../src/content/shell'
import { lessonById } from '../../src/live/load'
import { MODULE_IDS } from '../../src/state/learnerState'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: revamp-navigation / lesson-sidebar (D155; ID 8.2 lesson list, ID 8.3, ID 11, FR-LRN-03, NFR-02, NFR-04),
// lesson-blocks "Objectives block" and lesson-c1 "C1 plays its lesson file" (D158), lesson-outline retired.

const s = shellCopy.sidebar
const sidebar = () => screen.getByRole('navigation', { name: s.label })
const links = () => within(sidebar()).getAllByRole('link')
const ROUTES = ['/', '/module/C1', '/module/C5', '/module/C1/refresher', '/sandbox', '/readiness']
const css = () => readFileSync('src/ui/navigation/sidebar.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const at = (current: string, completed: string[]) => backendWith(progressState({ currentModule: current as never, completedModules: completed as never }))

describe('lesson-sidebar: the sidebar lists the nine lessons (ID 8.2, D155)', () => {
  it('nine links, C1 to C9 in order, code and title, to each lesson', () => {
    renderRoutes(backendWith(), '/module/C4')
    expect(links()).toHaveLength(9)
    links().forEach((a, i) => {
      const id = MODULE_IDS[i]
      expect(a).toHaveAttribute('href', expect.stringMatching(new RegExp(`/module/${id}$`)))
      expect(a).toHaveAccessibleName(new RegExp(`^${id}\\b.*${lessonById(id.toLowerCase())!.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
    })
    expect(moduleLabel('C1')).toContain(lessonById('c1')!.title)
  })

  it('on every screen', () => {
    for (const r of ROUTES) {
      const { unmount } = renderRoutes(backendWith(), r)
      expect(screen.getAllByRole('navigation', { name: s.label }), r).toHaveLength(1)
      unmount()
    }
  })

  it('opening a lesson from the sandbox', () => {
    renderRoutes(backendWith(), '/sandbox')
    fireEvent.click(links()[3])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(lessonById('c4')!.title)
  })
})

describe('lesson-sidebar: progress and the page (ID 8.3, 11.1)', () => {
  it('Done, Up next, Not started, in words; never "You are here" (fix-sidebar-current-lesson, D164)', () => {
    renderRoutes(at('C3', ['C1', 'C2']), '/module/C4')
    const words = links().map((a) => a.querySelector('.progress-state')!.textContent)
    expect(words).toEqual([s.words.done, s.words.done, s.words.current, ...Array(6).fill(s.words.open)])
    expect([s.words.done, s.words.current, s.words.open]).toEqual(['Done', 'Up next', 'Not started'])
    expect(sidebar().textContent).not.toContain('You are here')
    for (const a of links()) expect(a.querySelector('.progress-symbol')!.textContent!.trim()).not.toBe('')
  })

  it('aria-current="page" only on the lesson being viewed', () => {
    const { unmount } = renderRoutes(at('C3', ['C1', 'C2']), '/module/C5')
    expect(links().filter((a) => a.getAttribute('aria-current') === 'page').map((a) => a.textContent)).toEqual([expect.stringContaining('C5')])
    unmount()
    renderRoutes(at('C3', ['C1', 'C2']), '/sandbox')
    expect(links().filter((a) => a.getAttribute('aria-current') === 'page')).toHaveLength(0)
  })
})

describe('lesson-sidebar: the viewed lesson is the one highlighted (fix-sidebar-current-lesson, D155, D164, ID 11.1)', () => {
  const byId = (id: string) => links().find((a) => a.getAttribute('data-lesson') === id)!

  it('viewing C3 with the current lesson C1: C3 is the page, C1 is the step and reads Up next', () => {
    renderRoutes(at('C1', []), '/module/C3')
    expect(byId('C3')).toHaveAttribute('aria-current', 'page')
    expect(byId('C1')).toHaveAttribute('aria-current', 'step')
    expect(byId('C1').querySelector('.progress-state')!.textContent).toBe('Up next')
    expect(links().filter((a) => a.getAttribute('aria-current') === 'page')).toHaveLength(1)
  })

  it('the strong highlight follows the page: primary border, primary tint, bold underlined title', () => {
    const rule = /\.lesson-sidebar\s+\.progress-item\[aria-current='page'\]\s*\{([^}]*)\}/.exec(css())
    expect(rule).not.toBeNull()
    expect(rule![1]).toMatch(/border[^;]*var\(--action-primary\)/)
    expect(rule![1]).toMatch(/background(-color)?:\s*var\(--action-primary-tint\)/)
    expect(css()).toMatch(/\.lesson-sidebar\s+\.progress-item\[aria-current='page'\]\s+\.progress-title\s*\{[^}]*font-weight:\s*700[^}]*text-decoration:\s*underline/)
  })

  it('the current lesson is not filled when another lesson is viewed', () => {
    const rule = /\.lesson-sidebar\s+\.progress-item\[data-state='current'\]:not\(\[aria-current='page'\]\)\s*\{([^}]*)\}/.exec(css())
    expect(rule).not.toBeNull()
    expect(rule![1]).toMatch(/border-width:\s*2px/)
    expect(rule![1]).toMatch(/background(-color)?:/)
    expect(rule![1]).not.toMatch(/--action-primary-tint/)
  })

  it('the highlight moves when another lesson is opened from the sidebar', () => {
    renderRoutes(at('C1', []), '/module/C1')
    expect(byId('C1')).toHaveAttribute('aria-current', 'page')
    fireEvent.click(byId('C4'))
    expect(byId('C4')).toHaveAttribute('aria-current', 'page')
    expect(byId('C1')).not.toHaveAttribute('aria-current', 'page')
  })
})

describe('lesson-sidebar: the sidebar stays in place (D3, D155, NFR-04)', () => {
  it('a sticky column from 768 px, the body a two-column grid with the sidebar first', () => {
    const wide = /@media\s*\(min-width:\s*768px\)\s*\{([\s\S]*?)\n\}/.exec(css())
    expect(wide).not.toBeNull()
    expect(wide![1]).toMatch(/\.app-body\s*\{[^}]*display:\s*grid/)
    expect(wide![1]).toMatch(/\.lesson-sidebar-column\s*\{[^}]*position:\s*sticky[^}]*\}/)
    expect(wide![1]).toMatch(/\.lesson-sidebar-column\s*\{[^}]*max-height:[^}]*overflow-y:\s*auto/)
    expect(wide![1]).toMatch(/\.lesson-sidebar-menu\s*\{[^}]*display:\s*none/)
  })

  it('the column is wide enough not to look squashed: at least 16rem, growing with the screen up to 20rem (user, 15 Nov)', () => {
    const wide = /@media\s*\(min-width:\s*768px\)\s*\{([\s\S]*?)\n\}/.exec(css())![1]
    expect(wide).toMatch(/\.app-body\s*\{[^}]*grid-template-columns:\s*clamp\(16rem,\s*22vw,\s*20rem\)\s+minmax\(0,\s*1fr\)/)
  })

  it('main fills its column, so a size container inside it (the sandbox) never collapses to zero width', () => {
    // Regression (user, 15 Nov): in the grid, main's auto margins made it shrink to fit; the sandbox's
    // container-type: inline-size then had no content width and every word wrapped onto its own line.
    expect(css()).toMatch(/\.app-body\s*>\s*\.app-main\s*\{[^}]*width:\s*100%[^}]*\}/)
    expect(css()).toMatch(/\.app-body\s*>\s*\.app-main\s*\{[^}]*box-sizing:\s*border-box/)
  })

  it('a Lessons button on a phone, closed by default', () => {
    expect(css()).toMatch(/\.lesson-sidebar-column\s*\{[^}]*display:\s*none/)
    renderRoutes(backendWith(), '/module/C4')
    expect(screen.getByRole('button', { name: s.menuButton })).toHaveAttribute('aria-expanded', 'false')
  })

  it('after the banner and before main; the skip link goes to main', () => {
    renderRoutes(backendWith(), '/module/C4')
    const banner = screen.getByRole('banner')
    const main = screen.getByRole('main')
    const nav = sidebar()
    expect(banner.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(nav.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const skip = screen.getByRole('link', { name: shellCopy.skipLinkLabel })
    expect(skip.getAttribute('href')).toBe(`#${main.id}`)
  })
})

describe('lesson-sidebar: accessible (NFR-02, ID 11.2)', () => {
  it('axe closed and with the Lessons button open', async () => {
    const { container } = renderRoutes(at('C3', ['C1', 'C2']), '/module/C4')
    expect(await axe(container), 'closed').toHaveNoViolations()
    fireEvent.click(screen.getByRole('button', { name: s.menuButton }))
    expect(await axe(container), 'open').toHaveNoViolations()
  }, 60_000)

  it('the viewed lesson has no magenta edge, and keeps its thick border and bold underlined title (D172, D164)', () => {
    const rule = (sel: string) => {
      const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return [...css().matchAll(new RegExp(`${esc}\\s*\\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join(';')
    }
    const page = rule(".lesson-sidebar .progress-item[aria-current='page']")
    expect(page).not.toMatch(/accent-highlight|border-inline-start/)
    expect(page).toMatch(/border-width:\s*4px/)
    expect(rule(".lesson-sidebar .progress-item[aria-current='page'] .progress-title")).toMatch(/font-weight:\s*700[\s\S]*text-decoration:\s*underline/)
  })

  it('44 px lesson links', () => {
    expect(css()).toMatch(/\.lesson-sidebar[^{]*\.progress-item[^{]*\{[^}]*min-height:\s*var\(--target-min\)/)
  })
})

describe('C1 route screen and no lesson outline (D158, lesson-outline retired)', () => {
  const toRoute = () => {
    renderRoutes(backendWith(), '/module/C1')
    fireEvent.click(screen.getByRole('button', { name: lessonCopy.controls.next }))
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Learning objectives') // D168
  }

  it('"Your route" shows the objectives only, not the nine lesson lines', () => {
    toRoute()
    const main = screen.getByRole('main')
    const c1 = lessonById('c1')!.screens.find((x) => x.id === 'c1-s02')! as unknown as { points: string[]; objectives: string[] }
    for (const o of c1.objectives) expect(main.textContent).toContain(o)
    for (const p of c1.points) expect(main.textContent, p).not.toContain(p)
  })

  it('no outline of the screens on any lesson', () => {
    for (const r of ['/module/C1', '/module/C3', '/module/C1/refresher']) {
      const { container, unmount } = renderRoutes(backendWith(), r)
      expect(container.querySelector('.lesson-outline, .lesson-layout'), r).toBeNull()
      unmount()
    }
  })
})
