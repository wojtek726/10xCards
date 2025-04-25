import type { Page } from '@playwright/test';

export async function mockAuthApi(page: Page) {
  // Mock Supabase auth endpoints
  await page.route('**/auth/v1/**', async (route, request) => {
    const url = request.url();
    const method = request.method();
    
    if (url.includes('/auth/v1/token')) {
      const body = request.postDataJSON();
      
      if (!body?.email?.includes('@')) {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: 'Invalid email address',
            message: 'Invalid email address'
          })
        });
        return;
      }
      
      if (body?.email === 'invalid@example.com' || body?.password === 'wrongpassword') {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: 'Invalid login credentials',
            message: 'Invalid login credentials'
          })
        });
        return;
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          expires_at: new Date(Date.now() + 3600000).getTime(),
          token_type: 'bearer',
          user: { 
            id: 'test-user-id', 
            email: body?.email || 'test@example.com',
            aud: 'authenticated',
            role: 'authenticated'
          }
        })
      });
    } 
    else if (url.includes('/auth/v1/user')) {
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'test-user-id',
            email: 'test@example.com',
            aud: 'authenticated',
            role: 'authenticated'
          })
        });
      } else {
        await route.continue();
      }
    }
    else if (url.includes('/auth/v1/signup')) {
      const body = request.postDataJSON();
      
      if (!body?.email?.includes('@')) {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: 'Invalid email address',
            message: 'Invalid email address'
          })
        });
        return;
      }
      
      if (body?.password?.length < 8) {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: 'Password should be at least 8 characters',
            message: 'Password should be at least 8 characters'
          })
        });
        return;
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          expires_at: new Date(Date.now() + 3600000).getTime(),
          token_type: 'bearer',
          user: { 
            id: 'test-user-id', 
            email: body?.email || 'test@example.com',
            aud: 'authenticated',
            role: 'authenticated'
          }
        })
      });
    }
    else {
      await route.continue();
    }
  });

  // Mock Supabase data API endpoints
  await page.route('**/rest/v1/**', async (route, request) => {
    const url = request.url();
    const method = request.method();

    if (url.includes('/rest/v1/profiles')) {
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify([{
            id: 'test-user-id',
            email: 'test@example.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        });
      } else {
        await route.continue();
      }
    }
    else {
      await route.continue();
    }
  });
} 