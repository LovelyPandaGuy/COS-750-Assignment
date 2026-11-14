import { act, fireEvent, screen, within } from '@testing-library/react'
import { useNavigate } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { startCopy } from '../../src/content/start'
import { backendWith, progressState, renderRoutes, throwingBackend } from './learner-fixtures'

// Spec: add-routing-and-screen-skeleton / app-routing. Requirement IDs: FR-LRN-03, FR-LRN-04, FR-VIS-08, NFR-02, NFR-05, NFR-06.

const h1s = () => screen.getAllByRole('heading', { level: 1 })
const banner = () => screen.getByRole('banner')
const crumb = () => banner().querySelector('.topbar-breadcrumb')?.textContent ?? ''
const actions = () => within(banner()).queryAllByRole('link').map((a) => a.textContent)

const ALL_PATHS = [
  '/',
  '/path',
  '/module/C1',
  '/module/C4',
  '/module/C9',
  '/module/C1/refresher',
  '/sandbox',
  '/readiness',
]

afterEach(() => vi.unstubAllGlobals())

describe('FR-LRN-04 route table', () => {
  it('each path opens one screen with one heading, and the headings differ', () => {
    const seen = new Set<string>()
    for (const path of ALL_PATHS) {
      const { unmount } = renderRoutes(backendWith(), path)
      expect(h1s(), path).toHaveLength(1)
      seen.add(h1s()[0].textContent!)
      unmount()
    }
    expect(seen.size).toBe(ALL_PATHS.length)
  })

  it('goes back and forward through history', () => {
    function Nav() {
      const go = useNavigate()
      return (
        <>
          <button onClick={() => go('/path')}>to-path</button>
          <button onClick={() => go('/module/C4')}>to-c4</button>
          <button onClick={() => go(-1)}>back</button>
          <button onClick={() => go(1)}>forward</button>
        </>
      )
    }
    renderRoutes(backendWith(), '/', <Nav />)
    const click = (n: string) => act(() => fireEvent.click(screen.getByRole('button', { name: n })))
    click('to-path')
    click('to-c4')
    click('back')
    click('back')
    expect(h1s()[0]).toHaveTextContent(startCopy.heading)
    click('forward')
    expect(h1s()[0]).toHaveTextContent('Your path')
  })

  it('makes no network request', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    for (const path of ALL_PATHS) renderRoutes(backendWith(), path).unmount()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('FR-LRN-04 unknown paths go somewhere safe', () => {
  it('unknown path and unknown module go to Start', () => {
    for (const path of ['/nowhere', '/module/C10', '/module/C10/explore']) {
      const { unmount } = renderRoutes(backendWith(), path)
      expect(h1s()[0], path).toHaveTextContent(startCopy.heading)
      unmount()
    }
  })

  it('old activity paths go to the lesson (app-routing, live-c1-and-c9)', () => {
    for (const [path, title] of [
      ['/module/C9/check', 'Am I ready for the lecture?'],
      ['/module/C9/explore', 'Am I ready for the lecture?'],
      ['/module/C1/check', 'Getting started and readiness check'],
      ['/module/C1/check/result', 'Getting started and readiness check'],
    ]) {
      const { unmount } = renderRoutes(backendWith(), path)
      expect(h1s()[0], path).toHaveTextContent(title)
      expect(screen.getByText(/^Screen 1 of/)).toBeInTheDocument()
      unmount()
    }
  })

  it('the redirect replaces the history entry', () => {
    function Nav() {
      const go = useNavigate()
      return (
        <>
          <button onClick={() => go('/nowhere')}>to-nowhere</button>
          <button onClick={() => go(-1)}>back</button>
        </>
      )
    }
    renderRoutes(backendWith(), '/path', <Nav />)
    act(() => fireEvent.click(screen.getByRole('button', { name: 'to-nowhere' })))
    expect(h1s()[0]).toHaveTextContent(startCopy.heading)
    act(() => fireEvent.click(screen.getByRole('button', { name: 'back' })))
    expect(h1s()[0]).toHaveTextContent('Your path')
  })
})

describe('NFR-06 every route is in the shell', () => {
  it('has a banner, a main, one heading and the saved pill, or the not-saved pill', () => {
    for (const [backend, pill] of [
      [() => backendWith(), startCopy.savedPill],
      [() => throwingBackend(), startCopy.notSavedPill],
    ] as const) {
      for (const path of ALL_PATHS) {
        const { unmount } = renderRoutes(backend(), path)
        expect(screen.getAllByRole('banner'), path).toHaveLength(1)
        expect(screen.getAllByRole('main'), path).toHaveLength(1)
        expect(h1s(), path).toHaveLength(1)
        expect(banner().querySelector('.topbar-status'), path).toHaveTextContent(pill)
        unmount()
      }
    }
  })

  it('has no axe violations on any route', async () => {
    for (const path of ALL_PATHS) {
      const { container, unmount } = renderRoutes(backendWith(progressState()), path)
      expect(await axe(container), path).toHaveNoViolations()
      unmount()
    }
  })
})

describe('FR-LRN-03 breadcrumb per screen', () => {
  it('names the module and the activity with its place', () => {
    renderRoutes(backendWith(), '/module/C1/refresher')
    expect(crumb()).toContain('C1 Getting started and readiness check')
    expect(crumb()).toContain('BST refresher')
  })

  it('an old lesson activity path redirects to the lesson (app-routing)', () => {
    renderRoutes(backendWith(), '/module/C6/check')
    expect(crumb()).toContain('C6 Insertion with rebalancing')
    expect(h1s()[0]).toHaveTextContent('Insertion with rebalancing')
    expect(screen.getByText('Screen 1 of 11')).toBeInTheDocument()
  })

  it('the C1 lesson', () => {
    renderRoutes(backendWith(), '/module/C1')
    expect(crumb()).toContain('C1 Getting started and readiness check')
  })

  it('result, hub, module, sandbox and readiness', () => {
    const cases: [string, string][] = [
      ['/path', 'Your path'],
      ['/module/C4', 'C4 Search'],
      ['/sandbox', 'Sandbox'],
      ['/readiness', 'Your readiness'],
    ]
    for (const [path, text] of cases) {
      const { unmount } = renderRoutes(backendWith(), path)
      expect(crumb(), path).toContain(text)
      unmount()
    }
  })

  it('Start has none', () => {
    renderRoutes(backendWith(), '/')
    expect(banner().querySelector('.topbar-breadcrumb')).toBeNull()
  })
})

describe('FR-VIS-08 TopBar actions per screen', () => {
  const both = ['Sandbox', 'Lecture questions']
  const table: [string, string[]][] = [
    ['/path', both],
    ['/module/C4', both],
    ['/module/C5', both],
    ['/module/C5/explore', both],
    ['/module/C9', both],
    ['/module/C1', []],
    ['/module/C1/refresher', []],
    ['/', []],
    ['/sandbox', ['Lecture questions']],
    ['/readiness', ['Sandbox']],
  ]

  it('follows the wireframes', () => {
    for (const [path, expected] of table) {
      const { unmount } = renderRoutes(backendWith(), path)
      expect(actions(), path).toEqual(expected)
      if (expected.length === 0) expect(banner().querySelector('.topbar-actions'), path).toBeNull()
      unmount()
    }
  })

  it('Sandbox opens the sandbox and Lecture questions the readiness summary', () => {
    renderRoutes(backendWith(), '/module/C5/explore')
    fireEvent.click(within(banner()).getByRole('link', { name: 'Sandbox' }))
    expect(h1s()[0]).toHaveTextContent('Sandbox')
  })

  it('Lecture questions opens the readiness summary', () => {
    renderRoutes(backendWith(), '/module/C5/explore')
    fireEvent.click(within(banner()).getByRole('link', { name: 'Lecture questions' }))
    expect(h1s()[0]).toHaveTextContent('Ready for the lecture?')
  })

  it('actions are links with an href', () => {
    renderRoutes(backendWith(), '/path')
    for (const a of within(banner()).getAllByRole('link')) {
      expect(a.tagName).toBe('A')
      expect(a.getAttribute('href')).toBeTruthy()
    }
  })
})

describe('NFR-02 browser title per screen', () => {
  it('is the heading then "· AVL Primer"', () => {
    const first = renderRoutes(backendWith(), '/path')
    expect(document.title).toBe('Your path · AVL Primer')
    first.unmount()
    renderRoutes(backendWith(), '/module/C4')
    expect(document.title).toBe('Search (the algorithm) · AVL Primer')
  })
})

describe('NFR-02 focus follows in-app navigation', () => {
  it('moves focus to the heading after following a link', () => {
    renderRoutes(backendWith(progressState()), '/path')
    fireEvent.click(screen.getByRole('link', { name: /^continue/i }))
    expect(h1s()[0]).toHaveTextContent('Search (the algorithm)')
    expect(h1s()[0]).toHaveFocus()
  })

  it('leaves focus alone on first load, with the skip link first', () => {
    const { container } = renderRoutes(backendWith(), '/module/C4')
    expect(h1s()[0]).not.toHaveFocus()
    const first = container.querySelector('a[href], button, [tabindex]:not([tabindex="-1"])')
    expect(first).toBe(screen.getByRole('link', { name: /skip to main content/i }))
  })

  it('Start and Resume still move focus to the module heading', () => {
    renderRoutes(backendWith())
    fireEvent.click(screen.getByRole('button', { name: startCopy.startButton }))
    expect(h1s()[0]).toHaveFocus()
  })
})
