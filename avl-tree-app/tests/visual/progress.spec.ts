import { expect, test } from '@playwright/test';

// Spec: revamp-progress-and-hub / ui-progress "Progress components at three widths", "Lesson states are
// shown by word, symbol and border" (greyscale), "Lesson menu" (phone placement). Quality bar 4, 7 and 8;
// NFR-02, D3, D118. Projects (playwright.config.ts) are the three widths: phone 390, tablet 768, desktop 1366.

async function open(page: import('@playwright/test').Page, theme = 'light') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/gallery.html?theme=${theme}`);
  const section = page.locator('[data-progress-gallery]');
  await section.waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  return section;
}

for (const theme of ['light', 'dark'] as const) {
  test(`progress components fit the page, keep 44 px targets and 16 px text, ${theme}`, async ({ page }) => {
    const section = await open(page, theme);

    const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
    expect(scroll).toBeLessThanOrEqual(width);

    const targets = section.locator('a, button');
    expect(await targets.count()).toBeGreaterThan(10);
    for (const t of await targets.all()) {
      if (!(await t.isVisible())) continue;
      const box = (await t.boundingBox())!;
      const what = await t.evaluate((e) => e.outerHTML.slice(0, 80));
      expect(box.width, what).toBeGreaterThanOrEqual(44);
      expect(box.height, what).toBeGreaterThanOrEqual(44);
    }

    const sizes = await section
      .locator('.progress-title, .progress-reason, .start-intro, .privacy-notice, .unit-goal, .progress-card-text, .lesson-progress-label')
      .evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    expect(sizes.length).toBeGreaterThan(5);
    for (const s of sizes) expect(s).toBeGreaterThanOrEqual(16);

    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await expect(section).toHaveScreenshot(`progress-${theme}.png`);
  });
}

test('the map stacks below 1366 px and sits in one row from 1366 px', async ({ page }, info) => {
  const section = await open(page);
  const map = section.locator('[data-gallery-map="mixed"] .progress-map');
  const tops = await map.locator('.progress-item').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(tops.length).toBe(9);
  if (info.project.name === 'desktop') expect(new Set(tops).size).toBe(1);
  else for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1]);
});

test('the lesson menu opens in the page flow at full width on a phone', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'phone placement is checked at 390 px');
  const section = await open(page);
  const menu = section.locator('[data-gallery-menu]');
  const button = menu.getByRole('button').first();
  await button.click();
  const panel = page.locator(`#${await button.getAttribute('aria-controls')}`);
  await expect(panel).toBeVisible();
  const p = (await panel.boundingBox())!;
  const b = (await button.boundingBox())!;
  const content = (await menu.boundingBox())!;
  expect(p.y).toBeGreaterThanOrEqual(b.y + b.height - 1);
  expect(Math.abs(p.width - content.width)).toBeLessThanOrEqual(1);
  expect(await panel.evaluate((e) => getComputedStyle(e).position)).not.toMatch(/fixed|absolute/);
  const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
  expect(scroll).toBeLessThanOrEqual(width);
  await expect(menu).toHaveScreenshot('progress-menu-phone-open.png');
});

test('D25 quality bar 7: greyscale, the four states differ by word and border style', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'greyscale is checked at 1366 px only');
  const section = await open(page);
  await page.addStyleTag({ content: 'html { filter: grayscale(1); }' });
  const items = section.locator('[data-gallery-map="mixed"] .progress-item');
  const byState = new Map<string, { word: string; border: string }>();
  for (const el of await items.all()) {
    const state = (await el.getAttribute('data-state'))!;
    byState.set(state, {
      word: ((await el.textContent()) ?? '').trim(),
      border: await el.evaluate((e) => `${getComputedStyle(e).borderStyle} ${getComputedStyle(e).borderWidth}`),
    });
  }
  expect([...byState.keys()].sort()).toEqual(['current', 'done', 'locked', 'open']);
  expect(new Set([...byState.values()].map((v) => v.border)).size).toBe(4);
  for (const v of byState.values()) expect(v.word.length).toBeGreaterThan(0);
  await expect(section.locator('[data-gallery-map="mixed"]')).toHaveScreenshot('progress-greyscale.png');
});
