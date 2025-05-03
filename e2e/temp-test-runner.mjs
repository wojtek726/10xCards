import { test, expect } from './setup/test-environment.js';
process.env.PLAYWRIGHT_SKIP_VITEST = '1';
process.env.NODE_ENV = 'test';

// Import only essential test files
import './auth.spec.ts';
import './flashcard-management.spec.ts';
import './user-flows.spec.ts';
