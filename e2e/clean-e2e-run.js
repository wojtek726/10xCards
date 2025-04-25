#!/usr/bin/env node

/**
 * This script runs Playwright tests in a clean environment
 * to avoid conflicts with other test frameworks like Vitest.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the command line arguments, skipping the first two (node and script name)
const args = process.argv.slice(2);

// Set the command - enable experimental fetch for Astro
const cmd = `NODE_OPTIONS="--experimental-fetch --no-warnings" npx playwright test ${args.join(' ')}`;

try {
  // Execute the command in a completely fresh process
  execSync(cmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Clear any Vitest and Jest variables
      VITEST: undefined,
      VITEST_WORKER_ID: undefined,
      VITEST_POOL_ID: undefined,
      JEST_WORKER_ID: undefined,
      NODE_PATH: process.env.NODE_PATH, // Keep the Node path
      PATH: process.env.PATH // Keep the path
    },
    cwd: path.resolve(__dirname, '..')
  });
} catch (error) {
  // Forward the exit code
  process.exit(error.status);
} 