/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['src/**/*.test.ts'],
    exclude: [
      'e2e/**/*',
      'src/**/*.e2e.test.ts',
      'src/**/*.visual.test.ts'
    ],
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.astro/',
        'dist/',
        'tests/setup.ts',
        'e2e/**',
        'playwright-report/**',
        'tests-examples/**',
        'src/pages/**',
        'src/layouts/**',
        'src/db/**',
        'src/hooks/**',
        'src/mocks/**'
      ],
      include: [
        'src/components/flashcards/**',
        'src/lib/utils.ts',
        'src/components/ui/form.tsx',
        'src/components/ui/button.tsx'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
}); 