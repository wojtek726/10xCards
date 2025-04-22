import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create the browser worker with our handlers
export const worker = setupWorker(...handlers);

// Function to initialize MSW
export function startMSW() {
  // Only initialize in development or test environments
  if (import.meta.env.DEV || import.meta.env.TEST) {
    worker.start({
      // Disable quiet mode to see MSW logs
      quiet: import.meta.env.PROD,
      
      // By default, MSW prints full request/response flow, which can be noisy
      // In production, you might want to make it quieter
      onUnhandledRequest: 'bypass'
    });
    
    console.log('[MSW] Mock Service Worker started');
  }
} 