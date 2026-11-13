import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { moduleLabel } from '../../src/content/modules'
import { LEARNER_KEY } from '../../src/state/storage'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-module-framework / module-hub delta, "Soft prerequisite note on the module screen".
// Requirement IDs: D20, D27, FR-LRN-04.

const h1 = () => screen.getByRole('heading', { level: 1 })
const note = () => screen.getByRole('note')
const noNote = () => expect(screen.queryByRole('note')).toBeNull()
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')

describe('D20 soft prerequisite note on the module screen', () => {
  it('early entry: C3 for a fresh learner names C2 and links to it', () => {
    renderRoutes(backendWith(), '/module/C3')
    expect(note()).toHaveTextContent(moduleLabel('C2'))
    expect(within(note()).getByRole('link')).toHaveAttribute('href', '/module/C2')
  })

  it('the note sits after the heading and before the activities, which stay enabled', () => {
    renderRoutes(backendWith(), '/module/C3')
    const list = screen.getByRole('list', { name: /activities/i })
    expect(h1().compareDocumentPosition(note()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(note().compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const links = within(list).getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/module/C3/explore', '/module/C3/example', '/module/C3/check'])
    for (const a of links) {
      expect(a).not.toHaveAttribute('aria-disabled')
      expect(a.getAttribute('tabindex')).not.toBe('-1')
    }
  })

  it('prerequisite done: no note on C3', () => {
    renderRoutes(backendWith(progressState({ completedModules: ['C1', 'C2'] })), '/module/C3')
    noNote()
  })

  it('C1 has no note', () => {
    renderRoutes(backendWith(), '/module/C1')
    noNote()
  })

  it('C8 skips the optional C7', () => {
    renderRoutes(backendWith(progressState({ completedModules: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] })), '/module/C8')
    noNote()
  })

  it('following the note opens C2 and leaves the learner state unchanged', () => {
    const backend = backendWith(progressState({ currentModule: 'C1', completedModules: [] }))
    const before = backend.getItem(LEARNER_KEY)
    renderRoutes(backend, '/module/C3')
    fireEvent.click(within(note()).getByRole('link'))
    expect(h1()).toHaveTextContent(moduleLabel('C2'))
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })
})

describe('D27 calm wording, targets and axe', () => {
  it('the note says nothing about locks, musts, fails or wrongs', () => {
    renderRoutes(backendWith(), '/module/C3')
    expect(note().textContent).not.toMatch(/\b(locked|must|fail\w*|wrong)\b/i)
    expect(strip(readFileSync('src/content/navigation.ts', 'utf8'))).not.toMatch(/\b(locked|must|fail\w*|wrong)\b/i)
  })

  it('the note link is a 44 px screen link and the screen is axe clean', async () => {
    const { container } = renderRoutes(backendWith(), '/module/C3')
    expect(within(note()).getByRole('link')).toHaveClass('screen-link')
    expect(await axe(container)).toHaveNoViolations()
  })
})
