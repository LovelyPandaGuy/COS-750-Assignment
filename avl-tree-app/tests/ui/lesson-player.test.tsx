import { readFileSync } from 'node:fs'
import { fireEvent, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { lessonCopy } from '../../src/content/lesson'
import { lessonById } from '../../src/live/load'
import { loadContent } from '../../src/live/load'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-live-lesson-content / lesson-player, lesson-blocks, step-replay (lesson replays),
// bst-refresher. ID 3.2, 7.2, 7.3, 8.1, 8.2, 8.3, 11.

const LESSONS = ['c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'] as const
const c = lessonCopy.controls

/** A learner who has answered every lesson check rightly, so Next passes the check screens (lesson-checks). */
const checksDone = () =>
  progressState({
    attempts: loadContent().content!.checks.questions.map((q) => ({ questionId: q.id, at: '2026-11-14T10:00:00.000Z', answer: null, correct: true, hintsUsed: 0, attempt: 1 })),
  })
const open = (lesson: string) => renderRoutes(backendWith(checksDone()), `/module/${lesson.toUpperCase()}`)
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const h1 = () => screen.getByRole('heading', { level: 1 })
const h2 = () => screen.getByRole('heading', { level: 2 })
const next = (times = 1) => {
  for (let i = 0; i < times; i++) fireEvent.click(btn(c.next))
}
/** Open a lesson at the screen with this id, by pressing Next. */
const at = (lesson: string, id: string) => {
  const r = open(lesson)
  next(lessonById(lesson)!.screens.findIndex((s) => s.id === id))
  return r
}
const region = (r: ReturnType<typeof open>, cls: string) => r.container.querySelector(`.${cls}`) as HTMLElement
const node = (root: Element, key: number) => root.querySelector(`[data-key="${key}"]`) as SVGGElement

describe('lesson-player: a lesson plays its screens in order (ID 3.2)', () => {
  it('first screen', () => {
    open('c3')
    expect(h2()).toHaveTextContent('Spot the problem')
  })

  it('every lesson uses the player, with the same frame regions in the same order', () => {
    for (const id of LESSONS) {
      const r = open(id)
      const lesson = lessonById(id)!
      for (let i = 0; i < lesson.screens.length; i++) {
        const order = ['lesson-top', 'lesson-screen', 'lesson-main', 'lesson-caption', 'control-strip'].map((k) => region(r, k))
        for (const el of order) expect(el, `${lesson.screens[i].id}`).not.toBeNull()
        for (let k = 1; k < order.length; k++) expect(order[k - 1].compareDocumentPosition(order[k]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        if (i < lesson.screens.length - 1) next()
      }
      r.unmount()
    }
  }, 60_000)
})

describe('lesson-player: the frame (ID 8.2, 8.3)', () => {
  it('top region', () => {
    at('c3', 'c3-s04')
    expect(h1()).toHaveTextContent('The AVL property')
    expect(screen.getByText('Lesson 3 of 9')).toBeInTheDocument()
    expect(screen.getByText('Screen 4 of 13')).toBeInTheDocument()
    expect(h2()).toHaveTextContent('Height')
  })

  it('phases in words', () => {
    const phases: Record<string, string> = { 'c3-s01': 'Problem', 'c3-s03': 'Recall', 'c3-s04': 'Learn', 'c3-s09': 'Practise', 'c3-s13': 'Check and summary' }
    for (const [id, word] of Object.entries(phases)) {
      const r = at('c3', id)
      expect(r.container.querySelector('.lesson-phase')).toHaveTextContent(word)
      r.unmount()
    }
  })
})

describe('lesson-player: controls in one place (ID 8.2)', () => {
  it('Next and Back, Back disabled first', () => {
    at('c3', 'c3-s04')
    next()
    expect(h2()).toHaveTextContent('Balance factor')
    fireEvent.click(btn(c.back))
    expect(h2()).toHaveTextContent('Height')
    const r = open('c2')
    expect(within(r.container).getAllByRole('button', { name: c.back }).at(-1)).toBeDisabled()
  })

  it('Show the rule only where it exists, and it toggles the rule (ID 8.2)', () => {
    const r = at('c3', 'c3-s04')
    expect(screen.queryByRole('button', { name: c.showRule })).toBeNull()
    next()
    const b = btn(c.showRule)
    const panel = r.container.querySelector('.lesson-rule-panel') as HTMLElement
    expect(panel).not.toBeVisible()
    fireEvent.click(b)
    expect(b).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toBeVisible()
    expect(panel).toHaveTextContent('bf = height of right branch − height of left branch. An empty branch has height −1.')
    fireEvent.click(b)
    expect(b).toHaveAttribute('aria-expanded', 'false')
  })

  it('the last screen opens the next lesson (remove-path-page, D159)', () => {
    at('c3', 'c3-s13')
    next()
    expect(h1()).toHaveTextContent('Search (the algorithm)')
  })

  it('after C9 the readiness report (D159)', () => {
    // C9's readiness questions gate Next too, so this learner has answered every question.
    const c = loadContent().content!
    const all = [...c.checks.questions, ...c.readiness.questions].map((q) => ({ questionId: q.id, at: '2026-11-14T10:00:00.000Z', answer: null, correct: true, hintsUsed: 0, attempt: 1 }))
    renderRoutes(backendWith(progressState({ attempts: all })), '/module/C9')
    next(lessonById('c9')!.screens.findIndex((x) => x.id === 'c9-s05'))
    expect(h2()).toHaveTextContent(lessonById('c9')!.screens.at(-1)!.title)
    next()
    expect(h1()).toHaveTextContent('Ready for the lecture?')
  })

  it('targets of 44 px come from the shared button class', () => {
    const css = readFileSync('src/ui/lesson/module.css', 'utf8')
    expect(css).toMatch(/\.module-button\s*\{[^}]*min-height:\s*var\(--target-min\)/)
  })
})

describe('lesson-player: skip ahead only on explanation screens (ID 8.2, D20)', () => {
  it('skip from an explanation', () => {
    at('c3', 'c3-s04')
    fireEvent.click(btn(c.skip))
    expect(h2()).toHaveTextContent('Your turn: balance factors')
  })

  it('no skip on a check', () => {
    at('c3', 'c3-s12')
    expect(screen.queryByRole('button', { name: c.skip })).toBeNull()
  })
})

describe('lesson-player: focus moves to each screen (NFR-02)', () => {
  it('focus after Next', () => {
    open('c3')
    next()
    expect(h2()).toHaveFocus()
  })
})

describe('lesson-player: the summary recaps the objectives (Gagné 9)', () => {
  it('C3 recap', () => {
    const r = at('c3', 'c3-s13')
    const recap = r.container.querySelector('.lesson-recap') as HTMLElement
    expect(within(recap).getByRole('heading', { name: lessonCopy.recapHeading })).toBeInTheDocument()
    expect(recap).toHaveTextContent('Calculate heights and balance factors, and decide whether a tree is an AVL tree (LO2).')
    expect(r.container.querySelectorAll('.lesson-box li')).toHaveLength(3)
  })
})

describe('lesson-player: accessible and responsive (NFR-02, ID 11.2)', () => {
  for (const id of LESSONS) {
    it(`axe on every ${id} screen`, async () => {
      const r = open(id)
      const n = lessonById(id)!.screens.length
      for (let i = 0; i < n; i++) {
        expect(await axe(r.container), `${id} screen ${i + 1}`).toHaveNoViolations()
        if (i < n - 1) next()
      }
    }, 120_000)
  }

  it('phone width: wide trees and tables scroll in their own region, pairs stack', () => {
    const tree = readFileSync('src/ui/tree/tree-view.css', 'utf8')
    const lesson = readFileSync('src/ui/lesson/lesson.css', 'utf8')
    expect(tree).toMatch(/\.tree-scroll\s*\{[^}]*overflow-x:\s*auto/)
    expect(lesson).toMatch(/\.lesson-pair\s*\{[^}]*grid-template-columns:\s*1fr;/)
    expect(lesson).toMatch(/\.lesson-table-scroll\s*\{[^}]*overflow-x:\s*auto/)
    expect(lesson).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/)
  })
})

describe('lesson-blocks: one component per content screen type (ID 8.1)', () => {
  it('same component everywhere', () => {
    for (const [lesson, id] of [['c2', 'c2-s07'], ['c3', 'c3-s05'], ['c8', 'c8-s04']]) {
      const r = at(lesson, id)
      expect(r.container.querySelector('.lesson-main .lesson-rule'), id).not.toBeNull()
      r.unmount()
    }
  })

  it('written rule with a tree: rule in main, tree supporting', () => {
    const r = at('c3', 'c3-s05')
    expect(region(r, 'lesson-main')).toHaveTextContent('The balance factor of a node is bf = h(right) − h(left).')
    expect(region(r, 'lesson-main').querySelector('svg')).toBeNull()
    expect(region(r, 'lesson-support').querySelector('svg')).not.toBeNull()
  })

  it('diagram: tree in main, caption directly under it', () => {
    const r = at('c3', 'c3-s04')
    expect(region(r, 'lesson-main').querySelector('svg')).not.toBeNull()
    expect(region(r, 'lesson-caption')).toHaveTextContent('10, 30 and 50 are leaves (height 0). 40 has height 1. The root 20 has height 2.')
  })

  it('objectives block', () => {
    at('c3', 'c3-s02')
    expect(screen.getByRole('heading', { level: 3, name: lessonCopy.objectivesHeading })).toBeInTheDocument()
    expect(screen.getByText('Calculate heights and balance factors, and decide whether a tree is an AVL tree (LO2).')).toBeInTheDocument()
  })

  it('case chart from conventions.json (ID 7.3)', () => {
    at('c5', 'c5-s06')
    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.map((row) => within(row).getByRole('rowheader').textContent)).toEqual(['Case 1 (LL)', 'Case 2 (LR)', 'Case 3 (RL)', 'Case 4 (RR)'])
    expect(rows[1]).toHaveTextContent('rotateLeft(n.left), then rotateRight(n)')
  })

  it('diagram with two trees', () => {
    const r = at('c3', 'c3-s08')
    const trees = r.container.querySelectorAll('.lesson-pair .tree-view')
    expect(trees).toHaveLength(2)
    expect(node(trees[1], 7).getAttribute('data-state')).toBe('out-of-balance')
    expect(node(trees[0], 5).getAttribute('data-state')).toBe('balanced')
  })

  it('worked example: steps one at a time, the named node highlighted', () => {
    const r = at('c3', 'c3-s07')
    expect(r.container.querySelectorAll('.lesson-steps li')).toHaveLength(1)
    fireEvent.click(btn(lessonCopy.worked.nextStep))
    expect(r.container.querySelectorAll('.lesson-steps li')).toHaveLength(2)
    expect(node(r.container, 10).querySelector('.tree-selected-frame')).not.toBeNull()
  })

  it('worked example without a tree', () => {
    const r = at('c8', 'c8-s06')
    expect(r.container.querySelector('.lesson-main svg')).toBeNull()
    fireEvent.click(btn(lessonCopy.worked.showAll))
    expect(r.container.querySelectorAll('.lesson-steps li')).toHaveLength(5)
  })

  it('hint opens through the Hint control (ID 9.4)', () => {
    const r = at('c2', 'c2-s08')
    const panel = r.container.querySelector('.lesson-hint-panel') as HTMLElement
    expect(panel).not.toBeVisible()
    fireEvent.click(btn(c.hint))
    expect(panel).toBeVisible()
    expect(panel).toHaveTextContent('A BST is only as fast as it is short.')
  })

  it('pseudocode: the two nine-line ID listings with headings (ID 7.4)', () => {
    at('c4', 'c4-s06')
    for (const name of ['Loop version', 'Recursive version']) {
      const section = screen.getByRole('region', { name })
      expect(within(section).getAllByRole('listitem')).toHaveLength(9)
    }
  })

  it('summary: points in one box, then the recap', () => {
    const r = at('c3', 'c3-s13')
    expect(r.container.querySelectorAll('.lesson-box li')).toHaveLength(3)
    expect(region(r, 'lesson-box').compareDocumentPosition(region(r, 'lesson-recap')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("C2's full summary has no box (ID 3.2)", () => {
    const r = at('c2', 'c2-s13')
    expect(r.container.querySelector('.lesson-box')).toBeNull()
    expect(r.container.querySelectorAll('.lesson-summary > div:first-child li')).toHaveLength(4)
    expect(region(r, 'lesson-recap')).not.toBeNull()
  })
})

describe('lesson-blocks and step-replay: animations from the engine (ID 7.2, 8.2)', () => {
  const a = lessonCopy.animation
  const stepAll = (r: ReturnType<typeof open>, scope?: Element) => {
    const root = scope ?? r.container
    let guard = 0
    while (guard++ < 80) {
      const b = within(root as HTMLElement).getAllByRole('button', { name: a.next })[0]
      if ((b as HTMLButtonElement).disabled) break
      fireEvent.click(b)
    }
  }

  it('search captions, and the lit pseudocode line follows each step', () => {
    const r = at('c4', 'c4-s04')
    const seen: string[] = []
    const lit: number[] = []
    for (let i = 0; i < 3; i++) {
      fireEvent.click(btn(a.next))
      seen.push(region(r, 'lesson-caption').textContent!)
      const items = within(screen.getByRole('region', { name: /^pseudocode/i })).getAllByRole('listitem')
      lit.push(items.findIndex((li) => li.getAttribute('aria-current') === 'step') + 1)
    }
    expect(seen).toEqual(['30 > 20: go right.', '30 < 40: go left.', '30 = 30: found.'])
    expect(lit).toEqual([8, 7, 5])
  })

  it('opens at position 0, paused, with one position per caption', () => {
    at('c5', 'c5-s07')
    expect(screen.getByText(a.stepOf(0, 10))).toBeInTheDocument()
  })

  it('two searches compared', () => {
    const r = at('c2', 'c2-s06')
    const halves = r.container.querySelectorAll('.lesson-pair > .lesson-animation')
    expect(halves).toHaveLength(2)
    for (const h of halves) stepAll(r, h)
    expect(halves[0]).toHaveTextContent(a.comparisons(5))
    expect(halves[1]).toHaveTextContent(a.comparisons(3))
    expect(node(halves[0], 'Z'.charCodeAt(0)).querySelector('.tree-key')).toHaveTextContent('Z')
  })

  it('rotation with roles and in-order check', () => {
    const r = at('c5', 'c5-s04')
    expect(r.container.querySelectorAll('.lesson-role-steps li')).toHaveLength(3)
    stepAll(r)
    const inorder = r.container.querySelector('.lesson-inorder')!
    expect(inorder).toHaveTextContent('In-order before: 20, 30, 40, 50, 60, 80, 90. After: 20, 30, 40, 50, 60, 80, 90. The BST order is unchanged.')
    expect(r.container.querySelector('.tree-description')!.textContent).toMatch(/^Root 80 .*Left child 30 of 80/)
  })

  it('leaf delete', () => {
    const r = at('c7', 'c7-s04')
    const seen: string[] = []
    for (let i = 0; i < 4; i++) {
      fireEvent.click(btn(a.next))
      seen.push(region(r, 'lesson-caption').textContent!)
    }
    expect(seen).toEqual(['50 is a leaf: remove it.', 'Node 40: bf = −1 − 0 = −1.', 'Node 20: bf = 1 − 0 = +1.', 'Every node has a balance factor of −1, 0 or +1.'])
  })

  it('What changed? at the end (ID 8.1 Kolb)', () => {
    const r = at('c5', 'c5-s08')
    expect(screen.queryByRole('heading', { name: a.whatChanged })).toBeNull()
    stepAll(r)
    expect(screen.getByRole('heading', { name: a.whatChanged })).toBeInTheDocument()
    fireEvent.click(btn(a.reveal))
    expect(r.container.querySelector('.lesson-what-changed')).toHaveTextContent('The single rotation only moves the problem: C now has balance factor +2.')
  })

  it('Replay step re-runs the current step', () => {
    at('c4', 'c4-s04')
    fireEvent.click(btn(a.next))
    fireEvent.click(btn(c.replay))
    expect(screen.getByText(a.stepOf(1, 3))).toBeInTheDocument()
  })
})

describe('bst-refresher: from the lesson file, on the lesson player', () => {
  it('heading, position and topics in order', () => {
    renderRoutes(backendWith(), '/module/C1/refresher')
    expect(h1()).toHaveTextContent('BST refresher')
    expect(screen.getByText('Lesson 1 of 9')).toBeInTheDocument()
    const titles: string[] = []
    for (let i = 0; i < 6; i++) {
      titles.push(h2().textContent!)
      if (i < 5) next()
    }
    expect(titles).toEqual(['The BST rule', 'Searching a BST', 'Inserting into a BST', 'Tree terms and height', 'Try it', 'Short re-check'])
  })

  it('skip ahead on explanation screens', () => {
    renderRoutes(backendWith(), '/module/C1/refresher')
    expect(btn(c.skip)).toBeInTheDocument()
  })
})

describe('live-content: the content-problem screen', () => {
  it('lists every problem with its file and id, and is axe clean', async () => {
    const { ContentProblem } = await import('../../src/ui/lesson/ContentProblem')
    const { render } = await import('@testing-library/react')
    const { MemoryRouter } = await import('react-router-dom')
    const { container } = render(
      <MemoryRouter>
        <ContentProblem
          problems={[
            { file: 'lessons/c3.json', id: 'c3-s04', field: 'merrillPhase', message: 'The screen needs "merrillPhase".' },
            { file: 'questions/checks.json', id: 'chk4-01', message: 'The id "chk4-01" is used twice.' },
          ]}
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(lessonCopy.problems.heading)
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('lessons/c3.json · c3-s04 · merrillPhase')
    expect(await axe(container)).toHaveNoViolations()
  })
})
