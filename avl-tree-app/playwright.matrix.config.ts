import { defineConfig } from '@playwright/test'
import base from './playwright.config'

// The state matrix (ui-quality-sweep, design decision 2): `npm run test:matrix`, not part of `npm test` or
// `npm run test:visual`. Same three widths as the visual tests; its own port and baseline folder.
// Each test also writes its check results to test-results/matrix/<entry>-<project>-<theme>.json (the audit input).
const PORT = 5176

export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: ['matrix*.spec.ts'],
  snapshotPathTemplate: 'tests/visual/__screenshots__/matrix/{arg}-{projectName}-{platform}{ext}',
  outputDir: 'test-results/matrix-run',
  timeout: 60_000,
  use: { ...base.use, baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/gallery.html`,
    reuseExistingServer: false,
  },
})
