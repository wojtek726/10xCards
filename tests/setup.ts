import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';

// Clear any mocks between tests
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

// Add custom matchers
expect.extend({
  // Add any custom matchers here
});

// Mock Service Worker setup (create and export the server to use in tests)
export const server = setupServer();

// Setup for MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Reset handlers between tests
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

// Global mock for window.matchMedia 
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
}); 