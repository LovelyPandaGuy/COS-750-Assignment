import { mkdirSync, writeFileSync } from 'node:fs'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { open, scopeOf } from './matrix/actions'
import { ENTRIES } from './matrix/states'

// Spec: ui-quality-sweep / ui-foundation "Quality bar 4" (larger text and zoom, landscape phone), "Quality bar 6"
// (keyboard walk, traps and return, focus and scroll after a change), "Quality bar 7" (simulations, forced
// colours), "Quality bar 9" (reduced motion on and off), ui-readiness print. Design decisions 3 and 4.
// NFR-02, NFR-04, FR-VIS-10, D25, D118. Soft checks; results go to test-results/matrix/modes/ for the audit,
// and the simulation, forced-colours and print screenshots go there too for the critique (task 2.2).

const OUT = 'test-results/matrix/modes'
const PAGES = ENTRIES.filter((e) => !e.route.startsWith('gallery:'))
const byId = (id: string) => ENTRIES.find((e) => e.id === id)!

function save(name: string, data: unknown): void {
  mkdirSync(OUT, { recursive: true })
  writeFileSync(`${OUT}/${name}.json`, JSON.stringify(data, null, 2))
}

// ---------- Quality bar 7: colour is never the only signal ----------

/** Pairs of same-kind elements whose state attribute differs and whose colour differs: do they differ otherwise too? */
async function colourOnlyPairs(page: Page, scope: string) {
  return page.evaluate((scope) => {
    const root = document.querySelector(scope) ?? document.body
    const els = [...root.querySelectorAll<HTMLElement>('[data-state], [data-status], [data-verdict], [aria-current], [aria-checked], [aria-pressed], [aria-selected]')].filter(
      (e) => e.getBoundingClientRect().width > 0,
    )
    const stateOf = (e: Element) =>
      ['data-state', 'data-status', 'data-verdict', 'aria-current', 'aria-checked', 'aria-pressed', 'aria-selected'].map((a) => `${a}=${e.getAttribute(a) ?? ''}`).join(';')
    const kind = (e: Element) => `${e.tagName}.${[...e.classList].sort().join('.')}`
    const look = (e: HTMLElement) => {
      const s = getComputedStyle(e)
      return {
        colour: `${s.color}|${s.backgroundColor}|${s.borderTopColor}|${s.fill}`,
        other: `${s.borderTopStyle}|${s.borderTopWidth}|${s.outlineStyle}|${s.fontWeight}|${s.textDecorationLine}|${s.borderRadius}`,
        text: (e.textContent ?? '').trim(),
        glyphs: [...e.querySelectorAll('svg, [aria-hidden="true"]')].map((g) => g.outerHTML.length).join(','),
      }
    }
    const groups = new Map<string, HTMLElement[]>()
    for (const e of els) groups.set(kind(e), [...(groups.get(kind(e)) ?? []), e])
    const bad: { kind: string; a: string; b: string }[] = []
    for (const [k, list] of groups) {
      const byState = new Map<string, HTMLElement>()
      for (const e of list) if (!byState.has(stateOf(e))) byState.set(stateOf(e), e)
      const reps = [...byState.entries()]
      for (let i = 0; i < reps.length; i++)
        for (let j = i + 1; j < reps.length; j++) {
          const [sa, a] = reps[i]
          const [sb, b] = reps[j]
          const la = look(a)
          const lb = look(b)
          if (la.colour === lb.colour) continue
          // Same text is fine only when something other than colour differs (a border, weight, glyph or mark).
          // Colour alone: nothing else differs, neither the text nor (when set) the accessible label.
          const sameLabel = a.getAttribute('aria-label') !== null && a.getAttribute('aria-label') === b.getAttribute('aria-label')
          if (la.other === lb.other && la.glyphs === lb.glyphs && (la.text === lb.text || sameLabel)) bad.push({ kind: k, a: sa, b: sb })
        }
    }
    return bad
  }, scope)
}

const VISION = ['achromatopsia', 'protanopia', 'deuteranopia', 'tritanopia'] as const

for (const entry of ENTRIES) {
  test(`mode colour ${entry.id}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'simulations at 1366 px only')
    await open(page, entry, 'light')
    const bad = await colourOnlyPairs(page, scopeOf(entry))
    save(`colour-${entry.id}`, { entry: entry.id, colourOnly: bad })
    // Screens for the critique: greyscale (achromatopsia) and the three colour-vision simulations.
    const cdp = await page.context().newCDPSession(page)
    for (const type of VISION) {
      await cdp.send('Emulation.setEmulatedVisionDeficiency', { type })
      await page.screenshot({ path: `${OUT}/vision/${entry.id}-${type}.png`, fullPage: !entry.route.startsWith('gallery:') })
    }
    await cdp.send('Emulation.setEmulatedVisionDeficiency', { type: 'none' })
    expect.soft(bad, 'states that differ by colour alone').toEqual([])
  })
}

for (const entry of PAGES) {
  test(`mode forced-colours ${entry.id}`, async ({ page }, info) => {
    test.skip(info.project.name === 'tablet', 'forced colours at 390 and 1366 px')
    await page.emulateMedia({ forcedColors: 'active' })
    await open(page, entry, 'light')
    const r = await page.evaluate(() => {
      const controls = [...document.querySelectorAll<HTMLElement>('main button, main a[href], main input:not([type="hidden"]), main select, main textarea, main [role="switch"], header button, header a[href]')].filter(
        (e) => e.getBoundingClientRect().width > 0,
      )
      const invisible = controls
        .filter((e) => {
          const s = getComputedStyle(e)
          const label = e.id ? document.querySelector(`label[for="${e.id}"]`) : e.closest('label')
          const text = (e.textContent ?? '').trim() || e.getAttribute('aria-label') || label?.textContent?.trim() || ''
          const boundary = s.borderTopStyle !== 'none' && parseFloat(s.borderTopWidth) > 0
          // An input with neither a boundary nor its own text is lost in forced colours.
          return e.tagName === 'INPUT' || e.tagName === 'SELECT' || e.tagName === 'TEXTAREA' ? !boundary && text === '' : !boundary && text === ''
        })
        .map((e) => e.outerHTML.slice(0, 90))
      return { controls: controls.length, invisible }
    })
    // Focus indicator in forced colours: tab to the first control in main.
    await page.locator('main').focus()
    await page.keyboard.press('Tab')
    const focusOutline = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement | null
      if (e === null || e === document.body) return 'none (nothing focused)'
      const s = getComputedStyle(e)
      return s.outlineStyle === 'none' || parseFloat(s.outlineWidth) === 0 ? `none on ${e.outerHTML.slice(0, 60)}` : 'ok'
    })
    await page.screenshot({ path: `${OUT}/forced/${entry.id}-${info.project.name}.png`, fullPage: true })
    save(`forced-${entry.id}-${info.project.name}`, { ...r, focusOutline })
    expect.soft(r.invisible, 'controls with no boundary or text in forced colours').toEqual([])
    expect.soft(focusOutline, 'focus outline in forced colours').toBe('ok')
  })
}

// ---------- Print (ui-readiness "Print view") ----------

for (const id of ['readiness-ready', 'readiness-revise', 'screen-certificate']) {
  test(`mode print ${id}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'print at 1366 px only')
    await open(page, byId(id), 'light')
    await page.emulateMedia({ media: 'print' })
    const r = await page.evaluate(() => {
      const main = document.querySelector('main')!
      const visibleText = [...main.querySelectorAll('h1, h2, h3, p, li, td, th')].filter((e) => {
        const s = getComputedStyle(e)
        return e.getBoundingClientRect().height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && (e.textContent ?? '').trim() !== ''
      }).length
      // Chrome that would put ink on paper: laid out, and not hidden with visibility (the certificate's approach).
      const chrome = [...document.querySelectorAll('header, .skip-link, .control-strip, .lesson-outline')]
        .filter((e) => e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden')
        .map((e) => e.outerHTML.slice(0, 80))
      return { visibleText, chromeShown: chrome.length, chrome }
    })
    await page.screenshot({ path: `${OUT}/print/${id}.png`, fullPage: true })
    save(`print-${id}`, r)
    expect.soft(r.visibleText, 'printed page has content').toBeGreaterThan(3)
    expect.soft(r.chromeShown, 'app chrome hidden in print').toBe(0)
  })
}

// ---------- Quality bar 4: 200% with larger text, and landscape phone ----------

async function layoutProblems(page: Page) {
  return page.evaluate(() => {
    const scroll = { scrollWidth: document.documentElement.scrollWidth, width: window.innerWidth }
    // Text boxes that overlap another text box (not nested in it).
    // Only what a reader can see: not scrolled out of a scroll box, and only inside an open modal dialog.
    const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
    const clippedOut = (e: Element) => {
      const r = e.getBoundingClientRect()
      for (let p = e.parentElement; p !== null && p !== document.body; p = p.parentElement) {
        const o = getComputedStyle(p)
        if (/(auto|scroll|hidden|clip)/.test(o.overflowY + o.overflowX)) {
          const pr = p.getBoundingClientRect()
          if (r.top < pr.top - 1 || r.bottom > pr.bottom + 1 || r.left < pr.left - 1 || r.right > pr.right + 1) return true
        }
      }
      return false
    }
    const leaves = [...document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p, main li, main label, main button, main a, main td, main th, main legend, main summary, [role="dialog"] *')].filter((e) => {
      const r = e.getBoundingClientRect()
      if (modal !== null && !modal.contains(e)) return false
      return r.width > 0 && r.height > 0 && !clippedOut(e) && [...e.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim() !== '')
    })
    const overlaps: string[] = []
    for (let i = 0; i < leaves.length && overlaps.length < 10; i++)
      for (let j = i + 1; j < leaves.length; j++) {
        const a = leaves[i]
        const b = leaves[j]
        if (a.contains(b) || b.contains(a)) continue
        const ra = a.getBoundingClientRect()
        const rb = b.getBoundingClientRect()
        const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
        const y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
        if (x > 2 && y > 2) overlaps.push(`${a.outerHTML.slice(0, 50)} / ${b.outerHTML.slice(0, 50)}`)
      }
    // Sideways scroll inside the page outside the tree's own scroll region.
    const wide = [...document.querySelectorAll<HTMLElement>('main *')]
      .filter((e) => e.closest('.tree-scroll, .lesson-table-scroll, .lesson-listing, pre') === null && e.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 5)
      .map((e) => e.outerHTML.slice(0, 80))
    return { scroll, overlaps, wide }
  })
}

for (const entry of PAGES) {
  test(`mode zoom-200 ${entry.id}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'phone', '390 px at 200% (195 CSS px) with the larger text')
    await page.setViewportSize({ width: 195, height: 422 })
    await open(page, { ...entry, settings: { ...entry.settings, textSize: 'large' } }, 'light')
    const r = await layoutProblems(page)
    save(`zoom-${entry.id}`, r)
    expect.soft(r.scroll.scrollWidth, 'no sideways page scroll at 200%').toBeLessThanOrEqual(r.scroll.width)
    expect.soft(r.wide, 'content past the edge outside scroll regions').toEqual([])
    expect.soft(r.overlaps, 'overlapping text at 200%').toEqual([])
  })

  test(`mode landscape ${entry.id}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'phone', 'landscape phone: 844 by 390')
    await page.setViewportSize({ width: 844, height: 390 })
    await open(page, entry, 'light')
    const r = await layoutProblems(page)
    const reach = await page.evaluate(() => ({
      heading: document.querySelector('main h1, main h2') !== null,
      mainControl: document.querySelector('.control-strip button, main button.btn-primary, main .tree-scroll, main a.btn') !== null,
    }))
    save(`landscape-${entry.id}`, { ...r, reach })
    expect.soft(r.scroll.scrollWidth, 'no sideways scroll in landscape').toBeLessThanOrEqual(r.scroll.width)
    expect.soft(r.overlaps, 'overlapping text in landscape').toEqual([])
    expect.soft(reach.heading, 'a heading can be reached').toBe(true)
  })
}

// ---------- Quality bar 9: reduced motion ----------

for (const entry of PAGES) {
  test(`mode reduced-motion ${entry.id}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'motion is width-independent')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, entry, 'light')
    // tokens.css sets 0.01 ms under reduced motion (a snap); anything longer is motion.
    const moving = await page.evaluate(() => {
      const ms = (v: string) => Math.max(...v.split(',').map((x) => (x.trim().endsWith('ms') ? parseFloat(x) : parseFloat(x) * 1000)))
      return [...document.querySelectorAll<HTMLElement>('body *')]
        .filter((e) => {
          const s = getComputedStyle(e)
          return ms(s.transitionDuration) > 0.01 || (s.animationName !== 'none' && ms(s.animationDuration) > 0.01)
        })
        .slice(0, 10)
        .map((e) => e.outerHTML.slice(0, 80))
    })
    save(`motion-${entry.id}`, { moving })
    expect.soft(moving, 'motion with reduced motion on').toEqual([])
  })
}

/**
 * The tree tweens node positions in JavaScript (src/ui/tree/motion.ts), not with CSS, so its motion is checked by
 * behaviour: after an insert that moves nodes, positions one frame later are compared with the settled ones.
 */
async function treeMotion(page: Page): Promise<{ moving: boolean; samples: number }> {
  await open(page, byId('sandbox-balanced'), 'light')
  const field = page.getByLabel(/^Key \(/)
  await field.fill('4')
  const positions = () => page.locator('[data-key]').evaluateAll((els) => els.map((e) => `${e.getAttribute('data-key')}:${Math.round(e.getBoundingClientRect().x)},${Math.round(e.getBoundingClientRect().y)}`).sort().join(' '))
  await page.getByRole('button', { name: 'Insert', exact: true }).click()
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  const early = await positions()
  await page.waitForTimeout(1500)
  const settled = await positions()
  return { moving: early !== settled, samples: settled.split(' ').length }
}

test('mode motion-on: tree nodes move when no preference is set', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'motion is width-independent')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const r = await treeMotion(page)
  save('motion-on-sandbox', r)
  expect.soft(r.samples).toBeGreaterThan(1)
  expect.soft(r.moving, 'tree nodes are mid-way one frame after an insert').toBe(true)
})

test('mode motion-off: tree nodes snap with reduced motion', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'motion is width-independent')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const r = await treeMotion(page)
  save('motion-off-sandbox', r)
  expect.soft(r.moving, 'tree nodes already settled one frame after an insert').toBe(false)
})

// ---------- Quality bar 6: keyboard ----------

for (const entry of PAGES) {
  test(`mode keyboard ${entry.id}`, async ({ page }, info) => {
    test.skip(info.project.name === 'tablet', 'keyboard walk at 390 and 1366 px')
    await open(page, entry, 'light')
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    const stops: { what: string; top: number; left: number; right: number; visible: boolean; ring: boolean; landmark: string }[] = []
    let first: string | null = null
    let bodies = 0
    for (let i = 0; i < 200; i++) {
      await page.keyboard.press('Tab')
      const s = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null
        if (e === null || e === document.body) return null
        const r = e.getBoundingClientRect()
        const cs = getComputedStyle(e)
        const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none'
        const visible = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && r.bottom > 0 && r.right > 0 && r.left < innerWidth
        const lm = e.closest('header, nav, main, aside, footer, [role="region"]')
        return { what: `${e.tagName} ${(e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 40)}`, top: r.top + scrollY, left: r.left, right: r.right, visible, ring, landmark: lm ? lm.tagName + (lm.getAttribute('aria-label') ?? '') : '' }
      })
      // From a blurred last control, Chromium's first Tab can rest on <body> before wrapping to the start.
      if (s === null) {
        if (++bodies > 2) break
        continue
      }
      const key = `${s.what}@${Math.round(s.top)}`
      if (key === first) break
      first ??= key
      stops.push(s)
    }
    const hidden = stops.filter((s) => !s.visible).map((s) => s.what)
    const noRing = stops.filter((s) => s.visible && !s.ring).map((s) => s.what)
    // Reading order: a stop more than one row (48 px) above the previous, in the same landmark and the same column
    // (the two overlap sideways). Moving from the foot of one column to the head of the next is reading order.
    const sameColumn = (a: (typeof stops)[number], b: (typeof stops)[number]) => a.left < b.right && b.left < a.right
    const inversions = stops
      .filter((s, i) => i > 0 && s.landmark === stops[i - 1].landmark && sameColumn(s, stops[i - 1]) && s.top < stops[i - 1].top - 48)
      .map((s) => s.what)
    save(`keyboard-${entry.id}-${info.project.name}`, { stops: stops.length, hidden, noRing, inversions })
    expect.soft(stops.length, 'something can be focused').toBeGreaterThan(0)
    expect.soft(hidden, 'focus on hidden elements').toEqual([])
    expect.soft(noRing, 'focus without a visible ring').toEqual([])
    expect.soft(inversions, 'focus order against reading order').toEqual([])
  })
}

/**
 * Escape is pressed with focus inside (one Tab after opening): does it close and return focus to the opener?
 * Then, on a second opening, ten Tabs: does focus stay inside? The opener is tagged to find it again.
 */
async function trap(page: Page, opener: Locator, container: string) {
  await opener.evaluate((e) => e.setAttribute('data-trap-opener', ''))
  const openerSel = '[data-trap-opener]'
  const inContainer = () => page.evaluate((c) => document.querySelector(c)?.contains(document.activeElement) ?? false, container)
  const isClosed = () =>
    page.evaluate((c) => {
      const el = document.querySelector<HTMLElement>(c)
      return el === null || el.hidden || el.getBoundingClientRect().height === 0
    }, container)

  await opener.click()
  if (!(await inContainer())) await page.keyboard.press('Tab')
  const reachedInside = await inContainer()
  await page.keyboard.press('Escape')
  const closes = await isClosed()
  const returnsFocus = await page.evaluate((o) => document.activeElement === document.querySelector(o), openerSel)

  if (!(await isClosed())) await opener.click()
  await opener.click()
  const inside: boolean[] = []
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab')
    inside.push(await inContainer())
  }
  return { reachedInside, closes, returnsFocus, staysInside: inside.every(Boolean) }
}

test('mode traps: Aa menu, reset dialog, lesson menu', async ({ page }, info) => {
  test.skip(info.project.name === 'tablet', 'at 390 and 1366 px')
  const results: Record<string, unknown> = {}
  // A fresh tab for each: the seed runs once per tab (actions.ts), so a reused tab keeps the last learner.
  const fresh = async (id: string) => {
    const p = await page.context().newPage()
    await open(p, byId(id), 'light')
    return p
  }
  const a = await fresh('module-c3-start')
  results.aaMenu = await trap(a, a.locator('.aa-button'), '.aa-panel')
  const r = await fresh('start-returning')
  results.resetDialog = await trap(r, r.getByRole('button', { name: 'Reset my progress' }), '[role="dialog"]')
  const g = await fresh('gallery-progress')
  results.lessonMenu = await trap(g, g.locator('[data-gallery-menu] .lesson-menu-button'), '[data-gallery-menu] .lesson-menu-panel')
  save(`traps-${info.project.name}`, results)
  for (const [name, r] of Object.entries(results) as [string, { reachedInside: boolean; staysInside: boolean; returnsFocus: boolean; closes: boolean }][]) {
    expect.soft(r.reachedInside, `${name}: focus can reach inside`).toBe(true)
    expect.soft(r.staysInside, `${name}: focus stays inside while open`).toBe(true)
    expect.soft(r.closes, `${name}: Escape closes it`).toBe(true)
    expect.soft(r.returnsFocus, `${name}: focus returns to its opener`).toBe(true)
  }
})

test('mode focus after a change: lesson Next and a route change', async ({ page }, info) => {
  test.skip(info.project.name === 'tablet', 'at 390 and 1366 px')
  await open(page, byId('module-c3-start'), 'light')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  const step = await page.evaluate(() => {
    const e = document.activeElement as HTMLElement
    const r = e.getBoundingClientRect()
    return { tag: e.tagName, text: (e.textContent ?? '').trim().slice(0, 40), inView: r.top >= 0 && r.bottom <= innerHeight }
  })
  await page.locator('header').getByText('Sandbox', { exact: true }).click()
  await page.waitForURL(/#\/sandbox/)
  // The route's effect moves focus after the new screen renders; give it up to a second before reading.
  await page.waitForFunction(() => document.activeElement?.tagName === 'H1', null, { timeout: 1000 }).catch(() => {})
  const route = await page.evaluate(() => {
    const e = document.activeElement as HTMLElement
    const r = e.getBoundingClientRect()
    return { tag: e.tagName, text: (e.textContent ?? '').trim().slice(0, 40), inView: r.top >= 0 && r.bottom <= innerHeight }
  })
  save(`focus-after-change-${info.project.name}`, { step, route })
  expect.soft(step.tag, 'after Next, focus on the new screen heading').toBe('H2')
  expect.soft(step.inView, 'after Next, the heading is in view').toBe(true)
  expect.soft(route.tag, 'after a route change, focus on the new screen heading').toBe('H1')
  expect.soft(route.inView, 'after a route change, the heading is in view').toBe(true)
})
