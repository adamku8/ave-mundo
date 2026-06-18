import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // We construct jsdom ourselves (per file, with polyfills) so the runner
    // itself stays in node. Playwright specs live in tests/e2e and are excluded.
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
