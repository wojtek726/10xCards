import type { Page } from '@playwright/test';

export async function mockAuthApi(page: Page) {
  await page.route('**/api/auth/**', async (route, request) => {
    const url = request.url();
    const _method = request.method();
    
    if (url.includes('/api/auth/login')) {
      const body = request.postDataJSON();
      if (body?.email === 'invalid@example.com') {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: 'Invalid login credentials'
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            user: { id: 'test-user-id', email: body?.email || 'test@example.com' },
            session: {
              access_token: 'test-access-token',
              refresh_token: 'test-refresh-token',
              expires_in: 3600
            }
          }),
          headers: {
            'Set-Cookie': 'sb-access-token=test-access-token; Path=/; HttpOnly; Secure; SameSite=Lax, sb-refresh-token=test-refresh-token; Path=/; HttpOnly; Secure; SameSite=Lax, supabase-auth-token={"access_token":"test-access-token","refresh_token":"test-refresh-token"}; Path=/; HttpOnly; Secure; SameSite=Lax'
          }
        });
      }
    } 
    else if (url.includes('/api/auth/session')) {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com' 
          },
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600
          }
        })
      });
    }
    else if (url.includes('/api/auth/signup')) {
      const body = request.postDataJSON();
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          user: { id: 'test-user-id', email: body?.email || 'test@example.com' }
        })
      });
    }
    else if (url.includes('/api/auth/logout')) {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    }
    else {
      await route.continue();
    }
  });

  // Mock user profile endpoint
  await page.route('**/api/users/me', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com'
        })
      });
    } else {
      await route.continue();
    }
  });
} 