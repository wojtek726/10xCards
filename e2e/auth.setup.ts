import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Create the auth directory if it doesn't exist
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Create a mock session for testing
  const mockSession = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString()
    }
  };

  // Navigate to our site first, so localStorage works
  await page.goto('/');
  
  // Create a simple auth state object
  const authState = {
    origins: [
      {
        origin: 'http://localhost:3000',
        localStorage: [
          { name: 'sb-access-token', value: mockSession.access_token },
          { name: 'sb-refresh-token', value: mockSession.refresh_token },
          { name: 'supabase-auth-token', value: JSON.stringify(mockSession) }
        ]
      }
    ]
  };
  
  // Write auth state directly to file
  fs.writeFileSync(authFile, JSON.stringify(authState, null, 2));
  
  console.log('Auth setup completed with mock data written directly to file');
}); 