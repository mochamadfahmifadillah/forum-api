import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['dotenv/config'],
    pool: 'forks',
    maxWorkers: 1,
    minWorkers: 1,
  },
});