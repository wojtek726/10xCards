/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
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
        'src/components/auth/**',
        'src/components/navigation/**',
        'src/mocks/**'
      ],
      include: ['src/components/flashcards/**', 'src/lib/utils.ts', 'src/components/ui/form.tsx', 'src/components/ui/button.tsx'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: ['node_modules', 'dist', 'e2e']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}); 