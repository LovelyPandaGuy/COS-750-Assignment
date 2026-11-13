import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { stepsFor } from '../../src/modules/schema'
import { playerCopy } from '../../src/content/modules/player'
import { practiceModuleCopy } from '../../src/content/modules/practice'
import { screenCopy } from '../../src/content/screens'
import { backendWith, renderRoutes } from './learner-fixtures'

// Spec: add-modules-c2-c3 / module-framework (player) and module-c3-avl-property (practice in the player).
// Requirement IDs: FR-LRN-04, FR-VIS-10, NFR-02, D20, D21, D23.

const h1 = () => screen.getByRole('heading', { level: 1 })
const h2 = () => screen.getByRole('heading', { level: 2 })
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const next = () => fireEvent.click(button(playerCopy.next))
const back = () => fireEvent.click(button(playerCopy.back))
const place = () => screen.getByText(/^Step \d+ of \d+$/)
const c2 = MODULE_CONTENT.C2!
const c3 = MODULE_CONTENT.C3!

/** Press Next until the step heading is `heading`. */
function goTo(heading: string) {
  for (let i = 0; i < 20 && h2().textContent !== heading; i++) next()
  expect(h2()).toHaveTextContent(heading)
}
const headingOf = (id: string) => [...c2.steps, ...c3.steps].find((s) => s.id === id)!.heading

describe('FR-LRN-04 step player position and navigation', () => {
  it('forward and back show the position', () => {
    renderRoutes(backendWith(), '/module/C2/explore')
    const m = stepsFor(c2, 'explore').length
    expect(place()).toHaveTextContent(`Step 1 of ${m}`)
    next()
    expect(place()).toHaveTextContent(`Step 2 of ${m}`)
    back()
    expect(place()).toHaveTextContent(`Step 1 of ${m}`)
  })

  it('h1 names the activity and h2 the step', () => {
    renderRoutes(backendWith(), '/module/C2/explore')
    expect(h1()).toHaveTextContent(screenCopy.activity.labels.explore)
    expect(h2()).toHaveTextContent(stepsFor(c2, 'explore')[0].heading)
  })

  it('Back on the first step goes to the module screen', () => {
    renderRoutes(backendWith(), '/module/C2/explore')
    back()
    expect(h1()).toHaveTextContent('When BSTs go lopsided')
  })

  it('Next on the last Explore step opens Worked example at step 1', () => {
    renderRoutes(backendWith(), '/module/C2/explore')
    const list = stepsFor(c2, 'explore')
    goTo(list[list.length - 1].heading)
    next()
    expect(h1()).toHaveTextContent(screenCopy.activity.labels.example)
    expect(place()).toHaveTextContent(`Step 1 of ${stepsFor(c2, 'example').length}`)
  })

  it('activities without content stay skeletons', () => {
    renderRoutes(backendWith(), '/module/C9/check')
    expect(screen.getByText(screenCopy.coming)).toBeInTheDocument()
    expect(screen.queryByText(/^Step \d+ of \d+$/)).toBeNull()
  })

  it('going back keeps practice answers given in the activity', () => {
    renderRoutes(backendWith(), '/module/C3/example')
    goTo(headingOf('c3-fill-in'))
    const items = screen.getAllByRole('treeitem')
    fireEvent.click(items[0])
    const field = screen.getByRole('textbox', { name: /balance factor/i })
    // Try every value until one is right; the tree is seeded at random. A plain BST of up to
    // 7 nodes can have a balance factor of up to ±6, so cover −7..7.
    for (let v = -7; v <= 7; v++) {
      fireEvent.change(field, { target: { value: String(v) } })
      fireEvent.click(button(/^check$/i))
      if (screen.getByRole('status').textContent?.startsWith("That's right")) break
    }
    const revealed = () => items[0].getAttribute('aria-label') ?? ''
    expect(revealed()).not.toMatch(/hidden/i)
    back()
    next()
    expect(screen.getAllByRole('treeitem')[0].getAttribute('aria-label') ?? '').not.toMatch(/hidden/i)
  })
})

describe('NFR-02 focus moves to each step', () => {
  it('focus is on the new step heading after Next', () => {
    renderRoutes(backendWith(), '/module/C2/explore')
    next()
    expect(document.activeElement).toBe(h2())
  })

  it('axe is clean on every C2 and C3 step', async () => {
    for (const [mod, content] of [['C2', c2], ['C3', c3]] as const) {
      for (const activity of ['explore', 'example', 'check'] as const) {
        const { unmount } = renderRoutes(backendWith(), `/module/${mod}/${activity}`)
        const n = stepsFor(content, activity).length
        for (let i = 0; i < n; i++) {
          expect(await axe(document.body), `${mod} ${activity} ${i + 1}`).toHaveNoViolations()
          if (i < n - 1) next()
        }
        unmount()
      }
    }
  }, 60_000)
})

describe('D23 control strip', () => {
  it('rule on demand', () => {
    renderRoutes(backendWith(), '/module/C3/explore')
    goTo(headingOf('c3-bf'))
    const show = button(playerCopy.showRule)
    expect(show).toHaveAttribute('aria-expanded', 'false')
    const rule = document.getElementById(show.getAttribute('aria-controls')!)!
    expect(rule).not.toBeVisible()
    fireEvent.click(show)
    expect(show).toHaveAttribute('aria-expanded', 'true')
    expect(rule).toBeVisible()
  })

  it('no aid, no button', () => {
    renderRoutes(backendWith(), '/module/C2/explore')
    expect(screen.queryByRole('button', { name: playerCopy.showRule })).toBeNull()
    expect(screen.queryByRole('button', { name: /^hint/i })).toBeNull()
  })

  it('navigation on one side, aids on the other, targets of 44 px', () => {
    renderRoutes(backendWith(), '/module/C3/explore')
    goTo(headingOf('c3-bf'))
    const strip = screen.getByRole('group', { name: playerCopy.stripLabel })
    const [nav, aids] = [...strip.children] as HTMLElement[]
    expect(within(nav).getByRole('button', { name: playerCopy.next })).toBeInTheDocument()
    expect(within(aids).getByRole('button', { name: playerCopy.showRule })).toBeInTheDocument()
    const css = readFileSync('src/ui/module/module.css', 'utf8')
    expect(css).toMatch(/min-height:\s*var\(--target-min\)/)
    expect(css).toMatch(/min-width:\s*var\(--target-min\)/)
  })
})

describe('D20 skip on explanation steps only', () => {
  it('skip from the first C3 content step opens Worked example', () => {
    renderRoutes(backendWith(), '/module/C3/explore')
    goTo(headingOf('c3-height'))
    fireEvent.click(button(playerCopy.skip))
    expect(h1()).toHaveTextContent(screenCopy.activity.labels.example)
    expect(place()).toHaveTextContent(`Step 1 of ${stepsFor(c3, 'example').length}`)
  })

  it('no skip on hook, practice, check or summary', () => {
    const first = renderRoutes(backendWith(), '/module/C3/explore')
    expect(screen.queryByRole('button', { name: playerCopy.skip })).toBeNull()
    first.unmount()
    renderRoutes(backendWith(), '/module/C3/example')
    goTo(headingOf('c3-fill-in'))
    expect(screen.queryByRole('button', { name: playerCopy.skip })).toBeNull()
  })
})

describe('D20 check placeholder until assessment exists', () => {
  it('C2 Check: coming line, then the summary, then the path; nothing completed', () => {
    const { storage } = renderRoutes(backendWith(), '/module/C2/check')
    expect(place()).toHaveTextContent('Step 1 of 2')
    expect(screen.getByText(screenCopy.coming)).toBeInTheDocument()
    next()
    expect(h2()).toHaveTextContent(stepsFor(c2, 'check')[1].heading)
    next()
    expect(h1()).toHaveTextContent(screenCopy.hub.heading)
    expect(storage.load().state.completedModules).toEqual([])
  })
})

describe('D21 practice in the player', () => {
  it('hints count down, then review the rule', () => {
    renderRoutes(backendWith(), '/module/C3/example')
    goTo(headingOf('c3-fill-in'))
    fireEvent.click(button(playerCopy.hint(2)))
    fireEvent.click(button(playerCopy.hint(1)))
    expect(screen.queryByRole('button', { name: /^hint/i })).toBeNull()
    expect(button(playerCopy.reviewRule)).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: practiceModuleCopy.hintsLabel })).getAllByRole('listitem')).toHaveLength(2)
  })

  it('nothing is stored', () => {
    const { storage } = renderRoutes(backendWith(), '/module/C3/example')
    goTo(headingOf('c3-fill-in'))
    fireEvent.click(screen.getAllByRole('treeitem')[0])
    fireEvent.change(screen.getByRole('textbox', { name: /balance factor/i }), { target: { value: '9' } })
    fireEvent.click(button(/^check$/i))
    expect(storage.load().state.attempts).toEqual([])
  })

  it('a new tree replaces the old one and resets answers and hints', () => {
    renderRoutes(backendWith(), '/module/C3/example')
    goTo(headingOf('c3-fill-in'))
    const keys = () => screen.getAllByRole('treeitem').map((el) => el.getAttribute('data-key')).join(',')
    const before = keys()
    fireEvent.click(button(playerCopy.hint(2)))
    fireEvent.click(button(/new tree/i))
    expect(keys()).not.toBe(before)
    expect(button(playerCopy.hint(2))).toBeInTheDocument()
  })
})
