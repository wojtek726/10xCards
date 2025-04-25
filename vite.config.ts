import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    environment: 'happy-dom',
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
  build: {
    rollupOptions: {
      external: [/\.test\./],
    },
  },
}); 