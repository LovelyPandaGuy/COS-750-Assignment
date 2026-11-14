import { expect, test } from '@playwright/test';

// Spec: revamp-question-and-feedback / ui-question "Question components at three widths" and ui-feedback
// "Feedback components at three widths". Quality bar 4 and 8; NFR-02, FR-VIS-10, D93, D97.
// Projects (playwright.config.ts) are the three widths: phone 390, tablet 768, desktop 1366.

for (const theme of ['light', 'dark'] as const) {
  test(`learn components fit the page, keep 44 px targets and 16 px text, ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/gallery.html?theme=${theme}`);
    const section = page.locator('[data-learn-gallery]');
    await section.waitFor();
    await page.evaluate(() => document.fonts.ready);
    // tokens.css gives every element a 0.01 ms transition under reduced motion; let sizes settle.
    await page.waitForFunction(() => document.getAnimations().length === 0);

    const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
    expect(scroll).toBeLessThanOrEqual(width);

    const targets = section.locator('.learn-option, .learn-stepper button, .learn-level, .learn-feedback a, .learn-feedback button, .learn-hint, .learn-draft button, .learn-full-answer button');
    expect(await targets.count()).toBeGreaterThan(10);
    for (const t of await targets.all()) {
      const box = (await t.boundingBox())!;
      expect(box.width, await t.evaluate((e) => e.outerHTML.slice(0, 80))).toBeGreaterThanOrEqual(44);
      expect(box.height, await t.evaluate((e) => e.outerHTML.slice(0, 80))).toBeGreaterThanOrEqual(44);
    }

    const sizes = await section
      .locator('.learn-stem, .learn-option-text, .learn-level-text, .learn-feedback-why, .learn-rung-title, .learn-draft textarea')
      .evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    expect(sizes.length).toBeGreaterThan(5);
    for (const s of sizes) expect(s).toBeGreaterThanOrEqual(16);

    // FullAnswer is collapsed by default in a real browser too (stylesheets must not override `hidden`).
    for (const d of await section.locator('.learn-full-answer').all()) {
      await expect(d.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
      await expect(d.locator('[hidden]')).toBeHidden();
    }
    // Nothing on the page took focus by itself.
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);

    await expect(section).toHaveScreenshot(`learn-${theme}.png`);
  });
}

test('D25 quality bar 7: greyscale, every state keeps a word or a border style', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'greyscale is checked at 1366 px only');
  await page.goto('/gallery.html');
  const section = page.locator('[data-learn-gallery]');
  await section.waitFor();
  await page.addStyleTag({ content: 'html { filter: grayscale(1); }' });
  for (const el of await section.locator('[data-state="not-yet"], [data-state="correct"]').all()) {
    expect(((await el.textContent()) ?? '').trim().length).toBeGreaterThan(0);
  }
  const styles = await section.locator('.learn-rung').evaluateAll((els) => els.map((e) => getComputedStyle(e).borderStyle + getComputedStyle(e).borderWidth));
  expect(new Set(styles).size).toBeGreaterThanOrEqual(3);
  await expect(section).toHaveScreenshot('learn-greyscale.png');
});
