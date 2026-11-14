// Runs a matrix entry's steps and seeds its storage (ui-quality-sweep, design decisions 1 and 2).
// Playwright only. Picked options are checked against the engine's marking by the coverage test.
import type { Page } from '@playwright/test'
import { LABELS, type Action, type Entry } from './states'
import { LEARNER_KEY, SETTINGS_KEY, learnerFor, settingsFor, type Theme } from './seed'

/** Seeds storage before any page script runs; for storageUnavailable, makes localStorage throw. */
export async function seed(page: Page, entry: Entry, theme: Theme): Promise<void> {
  const learner = learnerFor(entry.seed)
  const settings = settingsFor(theme, entry.settings)
  await page.addInitScript(
    ({ learnerKey, settingsKey, learner, settings, unavailable }) => {
      if (unavailable) {
        const fail = () => {
          throw new DOMException('The storage is unavailable', 'SecurityError')
        }
        Object.defineProperty(window, 'localStorage', { configurable: true, get: fail })
        return
      }
      // Only on the first load of this page, so a reload inside a test keeps what the app wrote.
      if (sessionStorage.getItem('matrix-seeded') !== null) return
      sessionStorage.setItem('matrix-seeded', '1')
      localStorage.clear()
      if (learner !== null) localStorage.setItem(learnerKey, JSON.stringify(learner))
      localStorage.setItem(settingsKey, JSON.stringify(settings))
    },
    { learnerKey: LEARNER_KEY, settingsKey: SETTINGS_KEY, learner, settings, unavailable: entry.seed === 'storageUnavailable' },
  )
}

/** The URL for an entry: an app route (HashRouter) or a gallery section. */
export function urlOf(entry: Entry, theme: Theme): string {
  if (entry.route.startsWith('gallery:')) return `/gallery.html?theme=${theme}`
  return `/#${entry.route}`
}

/** The element the entry's checks and screenshot cover: the page, or the gallery section. */
export function scopeOf(entry: Entry): string {
  return entry.route.startsWith('gallery:') ? `[${entry.route.slice('gallery:'.length)}]` : 'body'
}

async function run(page: Page, a: Action): Promise<void> {
  if ('screen' in a) {
    const outline = page.locator('.lesson-outline')
    await outline.waitFor()
    if ((await outline.locator('details').count()) > 0 && (await outline.locator('.lesson-outline-entry').count()) === 0) await outline.locator('summary').click()
    await outline.locator('.lesson-outline-entry').nth(a.screen).click()
    return
  }
  if ('outline' in a) {
    const outline = page.locator('.lesson-outline')
    if ((await outline.locator('details').count()) > 0 && (await outline.locator('.lesson-outline-entry').count()) === 0) await outline.locator('summary').click()
    return
  }
  if ('pick' in a) {
    await page.locator(`.q-card input[type="radio"][value="${a.pick}"]`).first().check({ force: true })
    return
  }
  if ('confidence' in a) {
    await page.locator(`input[type="radio"][value="${a.confidence}"]`).first().check({ force: true })
    return
  }
  if ('button' in a) {
    await page.getByRole('button', { name: a.button, exact: true }).first().click()
    return
  }
  if ('click' in a) {
    await page.locator(a.click).first().click()
    return
  }
  if ('sandbox' in a) {
    const toggle = page.getByRole('switch').first()
    if (((await toggle.getAttribute('aria-checked')) === 'true') !== a.sandbox.rebalance) await toggle.click()
    const field = page.getByLabel(/^Key \(/)
    for (const k of a.sandbox.keys) {
      await field.fill(String(k))
      await page.getByRole('button', { name: LABELS.INSERT, exact: true }).click()
    }
  }
}

/** Opens the entry, runs its steps and waits until fonts and transitions have settled. */
export async function open(page: Page, entry: Entry, theme: Theme): Promise<void> {
  await seed(page, entry, theme)
  await page.goto(urlOf(entry, theme))
  await page.locator(entry.route.startsWith('gallery:') ? scopeOf(entry) : '#main-content').first().waitFor()
  for (const a of entry.steps ?? []) await run(page, a)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => document.getAnimations().length === 0)
  // A full-page shot of a page with a sticky column depends on the scroll position: always start at the top.
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForFunction(() => window.scrollY === 0)
}
