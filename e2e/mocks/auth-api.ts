import type { Page } from '@playwright/test';

const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token'
};

export async function mockAuthApi(page: Page) {
  // Mock login endpoint
  await page.route('**/api/auth/login', async route => {
    const request = route.request();
    const body = request.postDataJSON();

    if (body.email === 'test@example.com' && body.password === 'password123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: TEST_USER.id, email: TEST_USER.email },
          access_token: TEST_USER.access_token,
          refresh_token: TEST_USER.refresh_token
        })
      });
    } else if (!body.email.includes('@')) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid email format' })
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid login credentials' })
      });
    }
  });

  // Mock signup endpoint
  await page.route('**/api/auth/signup', async route => {
    const request = route.request();
    const body = request.postDataJSON();

    if (body.password.length < 8) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Password must be at least 8 characters long' })
      });
    } else if (body.password !== body.confirmPassword) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Passwords do not match' })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: TEST_USER.id, email: body.email },
          access_token: TEST_USER.access_token,
          refresh_token: TEST_USER.refresh_token
        })
      });
    }
  });

  // Mock session endpoint
  await page.route('**/api/auth/session', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: null,
        accessToken: null,
        error: null
      })
    });
  });

  // Mock logout endpoint
  await page.route('**/api/auth/logout', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  // Mock password reset endpoint
  await page.route('**/api/auth/reset-password', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  // Mock user profile endpoint
  await page.route('**/api/users/me', async (route) => {
    const cookies = route.request().headers()['cookie'] || '';
    const hasAuthCookie = cookies.includes('sb-access-token');
    
    if (!hasAuthCookie) {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({
          error: 'Unauthorized'
        })
      });
      return;
    }
    
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
  });
} 