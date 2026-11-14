import { expect, test } from '@playwright/test';

// Spec: revamp-tree-controls / ui-tree-controls "Quality bar for the tree controls", QB4 (three widths) and
// QB8 (targets and text size); "Replay control strip": the strip wraps, navigation first, with no horizontal
// scroll (review C1, accepted 14 Nov 2026: the module page is at most 66ch wide). D93, NFR-04.
// The C6 Worked example opens on the "done for you" insert replay. With no representations from module data
// yet (proposal question 5), the replay shows everything. Projects: phone 390, tablet 768, desktop 1366.

test('FR-VIS-10 NFR-04 the C6 insert replay fits each width with 44 px targets', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/module/C6/example');
  const strip = page.getByRole('group', { name: /replay controls/i });
  await expect(strip).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.getAnimations().length === 0);

  // Step towards the end (the imbalance and rotation steps) so the caption holds its longest sentences.
  const stepButton = strip.getByRole('button', { name: 'Step', exact: true });
  for (let i = 0; i < 30 && (await stepButton.isEnabled()); i++) {
    await stepButton.click();
    if (/\b(rotate|unbalanced)\b/i.test((await page.locator('.replay-caption').textContent().catch(() => '')) ?? '')) break;
  }

  const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
  expect(scroll).toBeLessThanOrEqual(width);

  // The strip's two groups: navigation first. They may share a row or wrap; the page never scrolls sideways.
  const groups = strip.locator(':scope > [role="group"]');
  await expect(groups).toHaveCount(2);
  const [a, b] = [(await groups.nth(0).boundingBox())!, (await groups.nth(1).boundingBox())!];
  expect(a.y).toBeLessThanOrEqual(b.y + 1);
  const stripBox = (await strip.boundingBox())!;
  expect(stripBox.x + stripBox.width).toBeLessThanOrEqual(width + 1);

  for (const button of await strip.getByRole('button').all()) {
    const box = (await button.boundingBox())!;
    expect(box.width, await button.textContent() ?? '').toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  const caption = page.locator('.replay-caption');
  await expect(caption).toBeVisible();
  const size = await caption.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(16);

  await expect(page.locator('.replay')).toHaveScreenshot('replay-c6.png');
});
