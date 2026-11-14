import { defineConfig, devices } from '@playwright/test'

// Visual tests (add-ui-foundation, design decision 8): `npm run test:visual`, not part of `npm test`.
// The three projects are the layout widths in src/ui/breakpoints.ts. Baselines are committed under
// tests/visual/__screenshots__/ and carry the platform in their names. [OPEN] They are made on macOS.
const PORT = 5174

export default defineConfig({
  testDir: 'tests/visual',
  // The state matrix has its own config and script (ui-quality-sweep): `npm run test:matrix`.
  testIgnore: ['**/matrix*.spec.ts'],
  snapshotPathTemplate: 'tests/visual/__screenshots__/{arg}-{projectName}-{platform}{ext}',
  fullyParallel: true,
  reporter: 'list',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.001, animations: 'disabled' } },
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/gallery.html`,
    reuseExistingServer: false,
  },
})
