# Environment Variables

This document outlines the environment variables required for this application to function properly.

## Required Environment Variables

```env
# Supabase Configuration
# These variables can be prefixed with PUBLIC_ in CI environments
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter Configuration (for AI features)
OPENROUTER_API_KEY=your-openrouter-api-key

# Site Configuration
SITE_URL=http://localhost:3000
```

## Environment Variable Naming

The application handles two naming conventions for Supabase environment variables:

1. **Local Development**: Uses `SUPABASE_URL` and `SUPABASE_KEY`
2. **CI Environment**: Uses `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`

The application code now automatically checks for both naming patterns to ensure compatibility across different environments.

## GitHub Actions CI Configuration

When setting up GitHub Actions, ensure these variables are properly set as repository secrets:

```yaml
env:
  NODE_ENV: test
  PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
  PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Local Development

For local development, create a `.env` file at the root of your project with the values specified above. 