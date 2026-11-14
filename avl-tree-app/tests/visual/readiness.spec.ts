import { expect, test } from '@playwright/test';

// Spec: revamp-readiness / ui-readiness "Summary at three widths", "Status by word, symbol and border"
// (greyscale), "Print view". Quality bar 4, 7 and 8; NFR-02, D118. Projects: phone 390, tablet 768, desktop 1366.

async function open(page: import('@playwright/test').Page, theme = 'light') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/gallery.html?theme=${theme}`);
  const section = page.locator('[data-readiness-gallery]');
  await section.waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  return section;
}

for (const theme of ['light', 'dark'] as const) {
  test(`readiness components fit the page, keep 44 px targets and 16 px text, ${theme}`, async ({ page }) => {
    const section = await open(page, theme);
    const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
    expect(scroll).toBeLessThanOrEqual(width);

    const targets = section.locator('a, button, textarea');
    expect(await targets.count()).toBeGreaterThan(10);
    for (const t of await targets.all()) {
      if (!(await t.isVisible())) continue;
      const box = (await t.boundingBox())!;
      const what = await t.evaluate((e) => e.outerHTML.slice(0, 80));
      expect(box.width, what).toBeGreaterThanOrEqual(44);
      expect(box.height, what).toBeGreaterThanOrEqual(44);
    }
    const sizes = await section
      .locator('.readiness-name, .readiness-note, .readiness-flag-text, .readiness-question-text, .readiness-points li, .readiness-headline-line')
      .evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    expect(sizes.length).toBeGreaterThan(5);
    for (const s of sizes) expect(s).toBeGreaterThanOrEqual(16);

    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await expect(section).toHaveScreenshot(`readiness-${theme}.png`);
  });
}

test('the table is stacked cards at 390 px and a table from 768 px', async ({ page }, info) => {
  const section = await open(page);
  const table = section.locator('[data-gallery-summary="ready"] table').first();
  const head = table.locator('thead');
  const rows = table.locator('tbody tr');
  const first = (await rows.nth(0).boundingBox())!;
  const second = (await rows.nth(1).boundingBox())!;
  const cells = await rows.nth(0).locator('th, td').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  if (info.project.name === 'phone') {
    expect(await head.evaluate((e) => e.getBoundingClientRect().height)).toBeLessThanOrEqual(1);
    expect(new Set(cells).size).toBeGreaterThan(1);
    expect(second.y).toBeGreaterThan(first.y + first.height - 1);
  } else {
    await expect(head).toBeVisible();
    expect(new Set(cells).size).toBe(1);
  }
});

test('D25 quality bar 7: greyscale, ready and revise differ by word and border style', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'greyscale is checked at 1366 px only');
  const section = await open(page);
  await page.addStyleTag({ content: 'html { filter: grayscale(1); }' });
  const summary = section.locator('[data-gallery-summary="ready"]');
  const style = async (s: string) => summary.locator(`.readiness-status[data-status="${s}"]`).first().evaluate((e) => getComputedStyle(e).borderStyle);
  expect(await style('ready')).not.toBe(await style('revise'));
  await expect(summary.locator('table')).toHaveScreenshot('readiness-greyscale.png');
});

test('FR-RDY-03 print view: no controls, status words visible', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'print is checked at 1366 px only');
  const section = await open(page, 'dark');
  await page.emulateMedia({ media: 'print' });
  const summary = section.locator('[data-gallery-summary="ready"]');
  for (const c of await summary.locator('button, textarea').all()) await expect(c).toBeHidden();
  for (const w of await summary.locator('.readiness-status').all()) await expect(w).toBeVisible();
  const colours = await summary.evaluate((e) => [getComputedStyle(e).color, getComputedStyle(e).backgroundColor]);
  expect(colours[0]).not.toBe(colours[1]);
  await expect(summary).toHaveScreenshot('readiness-print.png');
});
