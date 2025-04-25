import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { register } from 'tsconfig-paths';

// Register path aliases for tests
register({
  baseUrl: '.',
  paths: {
    '@/*': ['./src/*']
  }
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
}); 