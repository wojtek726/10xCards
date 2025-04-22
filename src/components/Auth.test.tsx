import { describe, it, expect, vi } from 'vitest';

// Mock the modules completely to avoid rendering anything
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn()
  }))
}));

vi.mock('../db/supabase.client', () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(),
    }
  }
}));

vi.mock('@supabase/auth-ui-react', () => ({
  Auth: vi.fn(),
  ThemeSupa: 'mock-theme'
}));

// Special mock for window.location
vi.stubGlobal('window', {
  location: { 
    origin: 'http://localhost:4321'
  }
});

// Import the component after mocks
import AuthComponent from './Auth';

describe('AuthComponent', () => {
  it('should be defined', () => {
    // Simple test that just verifies the component can be imported
    expect(AuthComponent).toBeDefined();
  });
}); 