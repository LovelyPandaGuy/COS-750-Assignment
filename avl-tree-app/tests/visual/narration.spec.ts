import { expect, test } from '@playwright/test';

// Spec: add-narration / narration "Pause, resume and stop" (targets, words). The unavailable switch is
// checked by unit tests and the critique (it needs the app shell's styles). Quality bar 4, 5 and 7; NFR-02, D118.
// Projects: phone 390, tablet 768, desktop 1366.

async function open(page: import('@playwright/test').Page, theme = 'light') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/gallery.html?theme=${theme}`);
  const section = page.locator('[data-narration-gallery]');
  await section.waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  return section;
}

for (const theme of ['light', 'dark'] as const) {
  test(`narration controls fit, keep 44 px targets and show each state in words, ${theme}`, async ({ page }) => {
    const section = await open(page, theme);
    const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
    expect(scroll).toBeLessThanOrEqual(width);

    for (const state of ['idle', 'speaking', 'paused']) await expect(section.locator(`[data-gallery-narration="${state}"] [role="group"]`)).toBeVisible();

    const targets = section.locator('button');
    expect(await targets.count()).toBe(5);
    for (const t of await targets.all()) {
      const box = (await t.boundingBox())!;
      const what = await t.evaluate((e) => e.outerHTML.slice(0, 80));
      expect(box.width, what).toBeGreaterThanOrEqual(44);
      expect(box.height, what).toBeGreaterThanOrEqual(44);
      expect(((await t.textContent()) ?? '').trim().length, what).toBeGreaterThan(0);
    }
    await expect(section).toHaveScreenshot(`narration-${theme}.png`);
  });
}
