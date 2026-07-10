import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Unit-test config. Pure-logic tests only (no DOM), so the default node
 * environment is enough. The `@/` alias mirrors tsconfig so tests import the
 * same way app code does.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
