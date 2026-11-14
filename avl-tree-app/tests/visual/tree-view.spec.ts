import { expect, test } from '@playwright/test';

// Spec: revamp-tree-view / tree-view "Wide trees keep their size", scenario "Three widths" (D118).
// FR-VIS-10, NFR-04; quality bar 4 and 8. The widest 15-node tree: keys 1 to 15 in order with rebalancing off,
// built on the existing Sandbox page so nothing outside src/ui/tree changes. Projects: phone 390, tablet 768, desktop 1366.

test('FR-VIS-10 NFR-04 a 15-node chain fits the page and keeps 44 px nodes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/sandbox');
  const toggle = page.getByRole('switch');
  if ((await toggle.getAttribute('aria-checked')) === 'true') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  const field = page.getByLabel(/^Key \(/);
  for (let k = 1; k <= 15; k++) {
    await field.fill(String(k));
    await page.getByRole('button', { name: 'Insert', exact: true }).click();
  }
  await expect(page.locator('[data-key]')).toHaveCount(15);
  await page.evaluate(() => document.fonts.ready);
  // tokens.css gives every element a 0.01 ms transition under reduced motion; let the SVG's size settle.
  await page.waitForFunction(() => document.getAnimations().length === 0);

  const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
  expect(scroll).toBeLessThanOrEqual(width);

  const region = page.locator('.tree-scroll');
  const r = await region.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth, ox: getComputedStyle(el).overflowX }));
  if (r.sw > r.cw) expect(r.ox).toBe('auto');

  for (const hit of await page.locator('.tree-hit').all()) {
    const box = (await hit.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.locator('.tree-view')).toHaveScreenshot('tree-chain15.png');
});
