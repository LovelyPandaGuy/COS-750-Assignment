import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { expect, test, type Page } from '@playwright/test'
import { open, scopeOf } from './matrix/actions'
import { THEMES } from './matrix/seed'
import { ENTRIES, LABELS, type Entry } from './matrix/states'

// Spec: ui-quality-sweep / ui-foundation "State matrix" (baselines for every entry), "Quality bar 4" (three
// widths), "Quality bar 5" (axe on every entry, titles and landmarks, no live-region noise), "Quality bar 8"
// (targets and text). Design decision 2. NFR-02, NFR-04, FR-VIS-10, D118, D150.
// Checks are soft: one run records every failure, and writes them to test-results/matrix/ for the audit.

const AXE = createRequire(import.meta.url).resolve('axe-core/axe.min.js')
const MIN_TARGET = 44
const MIN_TEXT = 16

/** Records live-region text changes from the first script on the page (design decision 5). */
async function recordLiveRegions(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const log: { at: number; text: string; region: string }[] = []
    ;(window as unknown as { __live: typeof log }).__live = log
    const sel = '[aria-live], [role="status"], [role="alert"]'
    const seen = new WeakMap<Element, string>()
    const scan = () => {
      for (const el of document.querySelectorAll(sel)) {
        if (el.getAttribute('aria-live') === 'off') continue
        const text = (el.textContent ?? '').trim()
        if (seen.get(el) !== text) {
          seen.set(el, text)
          if (text !== '') log.push({ at: performance.now(), text, region: el.id || el.className || el.tagName })
        }
      }
    }
    new MutationObserver(scan).observe(document, { subtree: true, childList: true, characterData: true, attributes: true })
  })
}

interface Results {
  entry: string
  project: string
  theme: string
  scroll: { scrollWidth: number; width: number }
  smallTargets: { what: string; w: number; h: number }[]
  inlineLinks: number
  smallText: { what: string; size: number }[]
  axe: { id: string; impact: string | null; help: string; targets: string[] }[]
  page?: { title: string; mains: number; banners: number; skipTarget: string | null; skipOk: boolean }
  live: { repeats: { text: string; region: string }[]; idleChanges: number }
}

async function inPageChecks(page: Page, entry: Entry): Promise<Omit<Results, 'entry' | 'project' | 'theme' | 'axe' | 'live'>> {
  return page.evaluate(
    ({ scope, isPage, MIN_TARGET, MIN_TEXT }) => {
      const root = document.querySelector(scope) ?? document.body
      const visible = (el: Element) => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
      }
      const what = (el: Element) => el.outerHTML.slice(0, 90)
      const targets = root.querySelectorAll(
        'a[href], button, [role="button"], [role="switch"], [role="tab"], select, textarea, summary, input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), label:has(> input[type="radio"]), label:has(> input[type="checkbox"]), .tree-hit',
      )
      let inlineLinks = 0
      const smallTargets: { what: string; w: number; h: number }[] = []
      for (const t of targets) {
        if (!visible(t)) continue
        // Off the page until focused (the skip link): its focused size is the keyboard walk's check (task 1.4).
        const at = t.getBoundingClientRect()
        if (at.bottom <= 0 || at.right <= 0) continue
        // WCAG 2.5.8 exempts links inside a sentence; they are counted, not failed.
        if (t.tagName === 'A' && t.closest('p, li') !== null && getComputedStyle(t).display === 'inline') {
          inlineLinks++
          continue
        }
        const r = t.getBoundingClientRect()
        if (r.width < MIN_TARGET - 0.5 || r.height < MIN_TARGET - 0.5) smallTargets.push({ what: what(t), w: Math.round(r.width), h: Math.round(r.height) })
      }
      const smallText: { what: string; size: number }[] = []
      for (const el of root.querySelectorAll('p, li, td, dd, figcaption, blockquote')) {
        // The gallery's own cell captions are scaffolding, not app text.
        if (!visible(el) || el.closest('.gallery-label') !== null) continue
        const own = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0)
        if (!own) continue
        const size = parseFloat(getComputedStyle(el).fontSize)
        if (size < MIN_TEXT - 0.01) smallText.push({ what: what(el), size })
      }
      const skip = document.querySelector<HTMLAnchorElement>('a[href^="#"]')
      const skipTarget = skip?.getAttribute('href') ?? null
      return {
        scroll: { scrollWidth: document.documentElement.scrollWidth, width: window.innerWidth },
        smallTargets,
        inlineLinks,
        smallText,
        page: isPage
          ? {
              title: document.title,
              mains: document.querySelectorAll('main, [role="main"]').length,
              // A header is a banner only outside main, article, aside, nav and section (HTML-AAM).
              banners:
                [...document.querySelectorAll('header')].filter((h) => h.closest('main, article, aside, nav, section') === null && !h.hasAttribute('role')).length +
                document.querySelectorAll('[role="banner"]').length,
              skipTarget,
              skipOk: skipTarget !== null && document.querySelector(skipTarget)?.tagName === 'MAIN',
            }
          : undefined,
      }
    },
    { scope: scopeOf(entry), isPage: !entry.route.startsWith('gallery:'), MIN_TARGET, MIN_TEXT },
  )
}

async function runAxe(page: Page, entry: Entry): Promise<Results['axe']> {
  await page.addScriptTag({ path: AXE })
  return page.evaluate(async (scope) => {
    const axe = (window as unknown as { axe: { run: (ctx: unknown) => Promise<{ violations: { id: string; impact: string | null; help: string; nodes: { target: string[] }[] }[] }> } }).axe
    const r = await axe.run(document.querySelector(scope) ?? document)
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.map((n) => n.target.join(' ')) }))
  }, scopeOf(entry))
}

async function liveNoise(page: Page): Promise<Results['live']> {
  const before = await page.evaluate(() => (window as unknown as { __live: unknown[] }).__live.length)
  // An unchanged page must stay quiet: no announcement without a user action.
  await page.waitForTimeout(500)
  return page.evaluate((before) => {
    const log = (window as unknown as { __live: { at: number; text: string; region: string }[] }).__live
    const repeats: { text: string; region: string }[] = []
    for (let i = 1; i < log.length; i++) {
      const a = log[i - 1]
      const b = log[i]
      if (a.text === b.text && a.region === b.region && b.at - a.at < 1000) repeats.push({ text: b.text, region: b.region })
    }
    return { repeats, idleChanges: log.length - before }
  }, before)
}

for (const entry of ENTRIES) {
  for (const theme of THEMES) {
    test(`matrix ${entry.id} ${theme}`, async ({ page }, info) => {
      await recordLiveRegions(page)
      await open(page, entry, theme)

      const shot = `${entry.id}-${theme}.png`
      if (entry.route.startsWith('gallery:')) await expect.soft(page.locator(scopeOf(entry))).toHaveScreenshot(shot)
      else await expect.soft(page).toHaveScreenshot(shot, { fullPage: true })

      const checks = await inPageChecks(page, entry)
      const live = await liveNoise(page)
      const axe = await runAxe(page, entry)
      const results: Results = { entry: entry.id, project: info.project.name, theme, ...checks, axe, live }
      mkdirSync('test-results/matrix', { recursive: true })
      writeFileSync(`test-results/matrix/${entry.id}-${info.project.name}-${theme}.json`, JSON.stringify(results, null, 2))

      // Quality bar 4: no sideways page scroll.
      expect.soft(checks.scroll.scrollWidth, 'horizontal scroll').toBeLessThanOrEqual(checks.scroll.width)
      // Quality bar 8: targets and running text.
      expect.soft(checks.smallTargets, 'targets under 44 px').toEqual([])
      expect.soft(checks.smallText, 'running text under 16 px').toEqual([])
      // Quality bar 5: axe, titles and landmarks, live regions.
      expect.soft(axe, 'axe violations').toEqual([])
      if (checks.page !== undefined) {
        expect.soft(checks.page.title, 'page title names the screen').toMatch(new RegExp(`.+ · ${LABELS.TITLE_SUFFIX}$`))
        expect.soft(checks.page.mains, 'one main').toBe(1)
        expect.soft(checks.page.banners, 'one banner').toBe(1)
        expect.soft(checks.page.skipOk, 'skip link targets main').toBe(true)
      }
      expect.soft(live.repeats, 'repeated announcements').toEqual([])
      expect.soft(live.idleChanges, 'announcements without a user action').toBe(0)
    })
  }
}
