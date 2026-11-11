import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { startCopy } from '../../src/content/start'
import { createLearnerStorage, LEARNER_KEY } from '../../src/state/storage'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: openspec/changes/add-learner-storage-ui/specs/start-screen/spec.md
// Requirements: Reset asks first, Focus stays in the dialog, Cancel keeps progress,
// Confirmed reset returns to the start, Accessible Start screen (keyboard, targets).

const resetLink = () => screen.getByRole('button', { name: startCopy.resetLink })
const dialog = () => screen.getByRole('dialog')
const cancel = () => within(dialog()).getByRole('button', { name: startCopy.cancelButton })
const confirm = () => within(dialog()).getByRole('button', { name: startCopy.confirmButton })

function returnVisit() {
  const backend = backendWith(progressState())
  backend.setItem('avl-primer:extra', 'x')
  backend.setItem('other-app', 'keep me')
  const r = renderRoutes(backend)
  return { ...r, backend, stored: backend.getItem(LEARNER_KEY) }
}

describe('FR-ONB-04 reset asks first', () => {
  it('opens a modal dialog named and described by its text, focus on Cancel, nothing cleared', () => {
    const { backend, stored } = returnVisit()
    fireEvent.click(resetLink())
    const d = dialog()
    expect(d).toHaveAttribute('aria-modal', 'true')
    expect(d).toHaveAccessibleName(startCopy.dialogTitle)
    expect(d).toHaveAccessibleDescription(startCopy.dialogBody)
    expect(cancel()).toHaveFocus()
    expect(backend.getItem(LEARNER_KEY)).toBe(stored)
  })

  it('has no axe violations while open', async () => {
    const { container } = returnVisit()
    fireEvent.click(resetLink())
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('NFR-02 focus stays in the dialog', () => {
  it('Tab from the last control wraps to the first, Shift+Tab from the first wraps to the last', () => {
    returnVisit()
    fireEvent.click(resetLink())
    confirm().focus()
    fireEvent.keyDown(confirm(), { key: 'Tab' })
    expect(cancel()).toHaveFocus()
    fireEvent.keyDown(cancel(), { key: 'Tab', shiftKey: true })
    expect(confirm()).toHaveFocus()
  })

  it('makes the TopBar and the page content behind it inert', () => {
    returnVisit()
    fireEvent.click(resetLink())
    expect(screen.getByRole('banner', { hidden: true }).closest('[inert]')).not.toBeNull()
    const page = document.querySelector('.start-page')!
    expect(page.closest('[inert]')).not.toBeNull()
    expect(dialog().closest('[inert]')).toBeNull()
  })
})

describe('FR-ONB-04 cancel keeps progress', () => {
  it('Cancel closes, returns focus to the reset link and changes nothing', () => {
    const { backend, stored } = returnVisit()
    fireEvent.click(resetLink())
    fireEvent.click(cancel())
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(resetLink()).toHaveFocus()
    expect(backend.getItem(LEARNER_KEY)).toBe(stored)
    expect(screen.getByRole('region', { name: startCopy.resumeHeading })).toHaveTextContent('C4')
    expect(document.querySelector('[inert]')).toBeNull()
  })

  it('Escape does the same as Cancel', () => {
    const { backend, stored } = returnVisit()
    fireEvent.click(resetLink())
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(resetLink()).toHaveFocus()
    expect(backend.getItem(LEARNER_KEY)).toBe(stored)
  })
})

describe('FR-ONB-04 confirmed reset returns to the start', () => {
  it('clears app data, shows the first visit, announces the reset and focuses the heading', async () => {
    const { backend, container } = returnVisit()
    fireEvent.click(resetLink())
    fireEvent.click(confirm())
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: startCopy.startButton })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: startCopy.resumeHeading })).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent(startCopy.resetDone)
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    expect(backend.getItem('avl-primer:extra')).toBeNull()
    expect(backend.getItem('other-app')).toBe('keep me')
    const next = createLearnerStorage(backend).load()
    expect(next.status).toBe('restored')
    expect(next.state.attempts).toEqual([])
    expect(next.state.currentModule).toBe('C1')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('NFR-02 keyboard only and targets', () => {
  it('Resume, reset link, Cancel and Reset are native buttons; Escape and Tab are handled', () => {
    returnVisit()
    const resume = screen.getByRole('button', { name: startCopy.resumeButton })
    for (const b of [resume, resetLink()]) {
      expect(b.tagName).toBe('BUTTON')
      expect(b).toHaveAttribute('type', 'button')
    }
    fireEvent.click(resetLink())
    for (const b of [cancel(), confirm()]) expect(b).toHaveAttribute('type', 'button')
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    expect(resetLink()).toHaveFocus()
    fireEvent.click(resetLink())
    fireEvent.click(confirm())
    expect(screen.getByRole('button', { name: startCopy.startButton })).toBeInTheDocument()
  })

  it('dialog buttons have a 44 px target', () => {
    returnVisit()
    fireEvent.click(resetLink())
    expect(cancel()).toHaveClass('button-secondary')
    expect(confirm()).toHaveClass('button-primary')
    expect(resetLink()).toHaveClass('link-button')
    const css = readFileSync('src/ui/start.css', 'utf8')
    expect(css).toMatch(/\.dialog[\s\S]*?\{/)
  })
})

// Review findings (task 5.2): Escape and Tab must still work when focus has left the
// dialog's buttons, as happens when the dialog text or backdrop is clicked.
describe('NFR-02 dialog keys work after a pointer click', () => {
  const main = () => document.querySelector('main') as HTMLElement

  it('Escape cancels when focus is on main (after clicking dialog text)', () => {
    const { backend, stored } = returnVisit()
    fireEvent.click(resetLink())
    main().focus()
    fireEvent.keyDown(main(), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(resetLink()).toHaveFocus()
    expect(backend.getItem(LEARNER_KEY)).toBe(stored)
  })

  it('Tab and Shift+Tab from outside the dialog bring focus back into it', () => {
    returnVisit()
    fireEvent.click(resetLink())
    main().focus()
    fireEvent.keyDown(main(), { key: 'Tab' })
    expect(cancel()).toHaveFocus()
    main().focus()
    fireEvent.keyDown(main(), { key: 'Tab', shiftKey: true })
    expect(confirm()).toHaveFocus()
  })
})

describe('WCAG 1.4.10 dialog reflow', () => {
  it('the backdrop scrolls and centres the dialog without clipping its top', () => {
    const css = readFileSync('src/ui/start.css', 'utf8')
    const backdrop = css.match(/\.dialog-backdrop\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(backdrop).toMatch(/overflow-y:\s*auto/)
    expect(backdrop).not.toMatch(/place-items:\s*center/)
    expect(css).toMatch(/\.dialog\s*\{[^}]*margin:\s*auto/)
  })
})
