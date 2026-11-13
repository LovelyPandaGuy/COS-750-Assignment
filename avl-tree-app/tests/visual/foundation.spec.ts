import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// Spec: add-ui-foundation / ui-foundation "Visual baselines", "Three layout widths", "Fonts are self-hosted",
// "Button" (keyboard activation). Quality bar checks 4, 7; NFR-04, NFR-05, D25, D3.
// Projects (playwright.config.ts) are the three widths: phone 390, tablet 768, desktop 1366.

/** Opens the gallery with every off-origin request refused and recorded (NFR-05). */
async function openGallery(page: Page, theme: 'light' | 'dark' = 'light') {
  const offOrigin: string[] = [];
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.protocol === 'data:') return route.continue();
    offOrigin.push(url.href);
    return route.abort();
  });
  await page.goto(`/gallery.html?theme=${theme}`);
  await page.locator('[data-gallery-ready]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  return offOrigin;
}

for (const theme of ['light', 'dark'] as const) {
  test(`quality bar 4: gallery baseline, ${theme}`, async ({ page }) => {
    await openGallery(page, theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page).toHaveScreenshot(`gallery-${theme}.png`, { fullPage: true });
  });
}

test('D25 quality bar 7: greyscale baseline at desktop width, every chip and badge keeps its word and glyph', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'greyscale is checked at 1366 px only');
  await openGallery(page);
  await page.addStyleTag({ content: 'html { filter: grayscale(1); }' });
  for (const el of await page.locator('.chip, .badge').all()) {
    await expect(el.locator('svg[aria-hidden="true"]')).toHaveCount(1);
    expect(((await el.textContent()) ?? '').trim().length).toBeGreaterThan(0);
  }
  await expect(page).toHaveScreenshot('gallery-greyscale.png', { fullPage: true });
});

test('NFR-04 no horizontal scroll', async ({ page }) => {
  await openGallery(page);
  const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: window.innerWidth }));
  expect(scroll).toBeLessThanOrEqual(width);
});

test('NFR-05 the fonts are used and nothing leaves the origin', async ({ page }) => {
  const offOrigin = await openGallery(page);
  const loaded = await page.evaluate(() => [
    document.fonts.check('16px "Atkinson Hyperlegible Next"'),
    document.fonts.check('700 16px "Atkinson Hyperlegible Next"'),
    document.fonts.check('15px "Atkinson Hyperlegible Mono"'),
  ]);
  expect(loaded).toEqual([true, true, true]);
  const families = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
  expect(families).toContain('Atkinson Hyperlegible Next');
  expect(offOrigin).toEqual([]);
});

test('the gallery shows every state', async ({ page }) => {
  await openGallery(page);
  for (const variant of ['primary', 'secondary', 'quiet']) {
    for (const state of ['default', 'hover', 'focus', 'pressed', 'disabled']) {
      await expect(page.locator(`[data-variant="${variant}"][data-state="${state}"]`), `${variant} ${state}`).toHaveCount(1);
    }
  }
  for (const level of ['remember', 'understand', 'apply']) {
    await expect(page.locator(`.chip-${level}:not(.chip-interactive)`)).not.toHaveCount(0);
    await expect(page.locator(`.chip-${level}.chip-interactive`)).not.toHaveCount(0);
  }
  for (const state of ['secure', 'developing', 'not-yet']) {
    await expect(page.locator(`.badge-${state}`)).not.toHaveCount(0);
  }
  await expect(page.locator('.badge .badge-change')).not.toHaveCount(0);
});

test('D3 a Button is activated by click, Enter and Space', async ({ page }) => {
  await openGallery(page);
  const target = page.getByTestId('activation-target');
  const count = page.getByTestId('activation-count');
  await target.click();
  await expect(count).toHaveText('1');
  await target.focus();
  await page.keyboard.press('Enter');
  await expect(count).toHaveText('2');
  await page.keyboard.press('Space');
  await expect(count).toHaveText('3');
});

// Playwright needs the fixtures argument destructured, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test('the gallery is not part of the production build', async ({}, info) => {
  test.skip(info.project.name !== 'desktop', 'one build is enough');
  test.setTimeout(120_000);
  const out = mkdtempSync(join(tmpdir(), 'avl-build-'));
  try {
    execFileSync('npx', ['vite', 'build', '--outDir', out, '--emptyOutDir'], { stdio: 'pipe' });
    const all = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? all(join(dir, d.name)) : [d.name]));
    expect(existsSync(join(out, 'index.html'))).toBe(true);
    expect(all(out).filter((n) => /gallery/i.test(n))).toEqual([]);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
