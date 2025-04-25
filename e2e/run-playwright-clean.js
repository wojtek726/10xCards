#!/usr/bin/env node

// Simple script to run Playwright tests with a clean environment

// Clear the global expect object to avoid conflicts with Vitest
delete global.expect;

// Clear any jest-matchers symbols that might be present
const symbols = Object.getOwnPropertySymbols(global);
for (const symbol of symbols) {
  const symbolName = String(symbol);
  if (symbolName.includes('jest') || symbolName.includes('matchers')) {
    try {
      delete global[symbol];
    } catch (e) {
      console.warn(`Could not delete symbol ${symbolName}: ${e}`);
    }
  }
}

// Call Playwright directly
import { spawn } from 'child_process';

const args = process.argv.slice(2);
console.log('Running tests with clean environment...');

// Launch playwright in a process that won't inherit the modified globals
const playwright = spawn('npx', ['playwright', 'test', ...args], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Clear NODE_OPTIONS to prevent any preset module loading
    NODE_OPTIONS: '--no-node-snapshot',
    // Ensure we're running in test environment
    NODE_ENV: 'test'
  }
});

// Forward the exit code
playwright.on('close', (code) => {
  process.exit(code);
}); 