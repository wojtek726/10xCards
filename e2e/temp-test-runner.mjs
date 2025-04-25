
import { test, expect } from './setup/test-environment.js';
process.env.PLAYWRIGHT_SKIP_VITEST = '1';
process.env.NODE_ENV = 'test';

// Import your test files here
import './auth.spec.ts';
import './flashcard-management.spec.ts';
import './visual.spec.ts';
import './home.spec.ts';
import './login-form.spec.ts';
import './auth-mock.spec.ts';
import './auth-basic.spec.ts';
import './user-flows.spec.ts';
import './example.spec.ts';
