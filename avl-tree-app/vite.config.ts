import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    // Browser tests (Playwright) run with `npm run test:visual`, not here (add-ui-foundation, design decision 8).
    exclude: ['tests/visual/**', 'node_modules/**'],
  },
})
