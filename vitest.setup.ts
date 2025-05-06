import { beforeAll, vi } from 'vitest'

// Mock import.meta.env
vi.mock('virtual:env', () => ({
  default: {
    PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
    PUBLIC_SUPABASE_KEY: 'test-key-123',
    SITE_URL: 'http://localhost:3000'
  }
}))

beforeAll(() => {
  // Set process.env variables for Node.js environment
  process.env.PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
  process.env.PUBLIC_SUPABASE_KEY = 'test-key-123'
  process.env.SITE_URL = 'http://localhost:3000'

  // Mock import.meta.env
  vi.stubGlobal('import', {
    meta: {
      env: {
        PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
        PUBLIC_SUPABASE_KEY: 'test-key-123',
        SITE_URL: 'http://localhost:3000'
      }
    }
  })
}) 