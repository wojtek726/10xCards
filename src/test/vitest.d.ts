/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveTextContent(text: string): R;
  toHaveValue(value: string): R;
  toBeVisible(): R;
  toBeDisabled(): R;
}

declare module 'vitest' {
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
  
  export const describe: typeof import('vitest')['describe'];
  export const it: typeof import('vitest')['it'];
  export const test: typeof import('vitest')['test'];
  export const expect: typeof import('vitest')['expect'];
  export const vi: typeof import('vitest')['vi'];
  export const beforeEach: typeof import('vitest')['beforeEach'];
  export const afterEach: typeof import('vitest')['afterEach'];
}

declare global {
  const vi: typeof import('vitest')['vi'];
} 