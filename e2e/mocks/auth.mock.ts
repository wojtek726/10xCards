import type { Page } from '@playwright/test';

// Cookie names
const AUTH_COOKIE_NAMES = {
  accessToken: 'sb-access-token',
  refreshToken: 'sb-refresh-token',
  authCookie: 'supabase-auth-token'
};

// Test user data
export const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: {
    provider: 'email'
  },
  user_metadata: {},
  created_at: '2025-05-06T12:10:24.270Z'
};

// Mock session data
const mockSession = {
  access_token: `test-access-token-${Date.now()}`,
  refresh_token: `test-refresh-token-${Date.now()}`,
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: TEST_USER
};

export const setupAuthMocks = async (page: Page) => {
  // Set auth cookies
  await page.context().addCookies([
    {
      name: AUTH_COOKIE_NAMES.accessToken,
      value: mockSession.access_token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 604800 // 7 days
    },
    {
      name: AUTH_COOKIE_NAMES.refreshToken,
      value: mockSession.refresh_token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 604800 // 7 days
    },
    {
      name: AUTH_COOKIE_NAMES.authCookie,
      value: encodeURIComponent(JSON.stringify({
        access_token: mockSession.access_token,
        refresh_token: mockSession.refresh_token,
        expires_at: mockSession.expires_at,
        user: TEST_USER
      })),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 604800 // 7 days
    }
  ]);

  // Mock auth user endpoint
  await page.route('**/auth/v1/user', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(TEST_USER)
    });
  });

  // Mock auth token endpoint
  await page.route('**/auth/v1/token', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSession)
    });
  });

  // Mock auth session endpoint
  await page.route('**/auth/v1/session', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSession)
    });
  });

  // Mock user profile endpoint
  await page.route('**/api/users/me', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: TEST_USER.id,
        email: TEST_USER.email,
        created_at: TEST_USER.created_at,
        updated_at: TEST_USER.created_at
      })
    });
  });
}; 