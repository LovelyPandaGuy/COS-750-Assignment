import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { shellCopy } from '../../src/content/shell'
import { startCopy } from '../../src/content/start'
import { bootLearner } from '../../src/state/boot'
import { SETTINGS_KEY, createLearnerStorage, createSettingsStorage, memoryBackend, type KeyValueBackend } from '../../src/state/storage'
import { applyTheme } from '../../src/ui/theme'
import { backendWith, progressState, throwingBackend } from './learner-fixtures'

// Spec: add-dark-mode-toggle / display-theme and app-shell "Aa menu stub".
// Requirement IDs: NFR-02, NFR-05, FR-VIS-10, FR-ONB-04, D3, D16, D26.

const html = () => document.documentElement
const aa = () => screen.getByRole('button', { name: shellCopy.aaButtonName })
const openAa = () => fireEvent.click(aa())
const sw = () => screen.getByRole('switch', { name: shellCopy.darkTheme })

/** Boot as main.tsx does, over the given backend, then render the app at a hash route. */
function renderApp(backend: KeyValueBackend | null, hash = '#/') {
  window.location.hash = hash
  const storage = createLearnerStorage(backend)
  const initial = storage.load()
  const settings = createSettingsStorage(backend)
  const initialTheme = settings.load().theme
  applyTheme(initialTheme)
  return render(<App storage={storage} initial={initial} settings={settings} initialTheme={initialTheme} />)
}

afterEach(() => {
  html().setAttribute('data-theme', 'light')
  localStorage.clear()
  window.location.hash = ''
  vi.restoreAllMocks()
})

describe('NFR-02 dark theme switch', () => {
  it('the Aa panel holds the switch, off by default, and the placeholder line', () => {
    renderApp(memoryBackend())
    expect(html()).toHaveAttribute('data-theme', 'light')
    openAa()
    const panel = screen.getByRole('region', { name: shellCopy.aaButtonName })
    expect(within(panel).getByRole('switch', { name: shellCopy.darkTheme })).toHaveAttribute('aria-checked', 'false')
    expect(panel).toHaveTextContent(shellCopy.aaPanelLine)
  })

  it('click turns dark on, then off again', () => {
    renderApp(memoryBackend())
    openAa()
    fireEvent.click(sw())
    expect(sw()).toHaveAttribute('aria-checked', 'true')
    expect(html()).toHaveAttribute('data-theme', 'dark')
    fireEvent.click(sw())
    expect(sw()).toHaveAttribute('aria-checked', 'false')
    expect(html()).toHaveAttribute('data-theme', 'light')
  })

  it('keyboard: a native button, so Space activates it; focus stays on the switch', () => {
    renderApp(memoryBackend())
    openAa()
    const s = sw()
    expect(s.tagName).toBe('BUTTON')
    expect(s).toHaveAttribute('type', 'button')
    s.focus()
    fireEvent.click(s) // Space on a focused native button
    expect(html()).toHaveAttribute('data-theme', 'dark')
    expect(sw()).toHaveFocus()
  })

  it('applies across screens', () => {
    renderApp(memoryBackend())
    openAa()
    fireEvent.click(sw())
    openAa()
    window.location.hash = '#/module/C3'
    fireEvent(window, new HashChangeEvent('hashchange'))
    expect(html()).toHaveAttribute('data-theme', 'dark')
    openAa()
    expect(sw()).toHaveAttribute('aria-checked', 'true')
  })

  it('axe is clean with the panel open, switch off and on', async () => {
    const { container } = renderApp(memoryBackend())
    openAa()
    expect(await axe(container)).toHaveNoViolations()
    fireEvent.click(sw())
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the switch label comes from src/content/shell.ts', () => {
    const src = readFileSync('src/ui/ThemeSwitch.tsx', 'utf8')
    expect(src).not.toContain(shellCopy.darkTheme)
  })
})

describe('D16 the choice is kept as a setting', () => {
  it('saved dark is restored by boot, before any render', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: 'dark' }))
    const booted = bootLearner()
    expect(booted.initialTheme).toBe('dark')
  })

  it('main.tsx applies the theme before it renders', () => {
    const main = readFileSync('src/main.tsx', 'utf8')
    const apply = main.indexOf('applyTheme(')
    expect(apply).toBeGreaterThan(-1)
    expect(apply).toBeLessThan(main.indexOf('createRoot('))
  })

  it('a bad stored value boots light and the start screen renders', () => {
    const b = memoryBackend()
    b.setItem(SETTINGS_KEY, '{"theme":"purple"}')
    renderApp(b)
    expect(html()).toHaveAttribute('data-theme', 'light')
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('works when every storage call throws', () => {
    renderApp(throwingBackend())
    openAa()
    expect(() => fireEvent.click(sw())).not.toThrow()
    expect(html()).toHaveAttribute('data-theme', 'dark')
  })

  it('the switch saves; opening and closing the menu does not', () => {
    const b = memoryBackend()
    renderApp(b)
    openAa()
    openAa()
    expect(b.getItem(SETTINGS_KEY)).toBeNull()
    openAa()
    fireEvent.click(sw())
    expect(JSON.parse(b.getItem(SETTINGS_KEY)!)).toMatchObject({ theme: 'dark' })
  })
})

describe('FR-ONB-04 reset returns to light', () => {
  it('confirming reset while dark switches to light at once and removes the key', () => {
    const b = backendWith(progressState())
    createSettingsStorage(b).save({ theme: 'dark' })
    renderApp(b)
    expect(html()).toHaveAttribute('data-theme', 'dark')
    fireEvent.click(screen.getByRole('button', { name: startCopy.resetLink }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: startCopy.confirmButton }))
    expect(html()).toHaveAttribute('data-theme', 'light')
    expect(b.getItem(SETTINGS_KEY)).toBeNull()
  })
})

describe('NFR-02 no light-only colours in components', () => {
  it('no .tsx file under src sets a hex fill or stroke', () => {
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((n) => {
        const p = join(dir, n)
        return statSync(p).isDirectory() ? files(p) : p.endsWith('.tsx') ? [p] : []
      })
    for (const f of files('src')) expect(readFileSync(f, 'utf8'), f).not.toMatch(/(?:fill|stroke)=["']#/)
  })
})
