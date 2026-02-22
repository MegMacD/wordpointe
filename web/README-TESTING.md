# Testing Guide

This project uses [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/react) for testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized alongside the code they test:

```
src/
  lib/
    __tests__/
      password.test.ts
      points.test.ts
      bible-api.test.ts         # Bible verse validation & fetching
  components/
    __tests__/
      AuthGuard.test.tsx
      SearchableDropdown.test.tsx
      UserForm.test.tsx
  app/
    api/
      __tests__/
        auth.test.ts
        bible-verse.test.ts      # Bible API endpoint
        records-autocreate.test.ts # Auto-create verses
```

## Writing Tests

### Unit Tests (Utilities)

Test pure functions and utilities:

```typescript
import { hashPassword, verifyPassword } from '../password';

describe('Password Hashing', () => {
  it('should hash a password', () => {
    const password = 'testpassword123';
    const hash = hashPassword(password);
    expect(hash).toBeDefined();
  });
});
```

### Component Tests

Test React components with React Testing Library:

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### API Route Tests

Test API routes by calling them directly:

```typescript
import { POST } from '../../api/my-route/route';

describe('POST /api/my-route', () => {
  it('should handle requests', async () => {
    const request = new NextRequest('http://localhost/api/my-route', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

## Test Coverage Goals

- **Utilities**: 80%+ coverage (password hashing, points computation, etc.)
- **Components**: Focus on user interactions and critical paths
- **API Routes**: Test success and error cases

## Mocking

### Next.js Router

The router is automatically mocked in `jest.setup.js`:

```typescript
import { useRouter } from 'next/navigation';

// Already mocked, no setup needed
```

### API Calls

Mock fetch or API clients:

```typescript
global.fetch = jest.fn();

beforeEach(() => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'test' }),
  });
});
```

### Environment Variables

Set in `jest.setup.js` or per-test:

```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
```

## Best Practices

1. **Test behavior, not implementation** - Test what users see/do
2. **Keep tests simple** - One assertion per test when possible
3. **Use descriptive names** - `it('should return error when user not found')`
4. **Mock external dependencies** - Don't hit real APIs/databases
5. **Test edge cases** - Empty inputs, null values, errors
6. **Clean up** - Use `beforeEach`/`afterEach` to reset state

## Example Test Files

See the example tests in:
- `src/lib/__tests__/password.test.ts` - Utility function tests
- `src/lib/__tests__/points.test.ts` - Business logic tests
- `src/lib/__tests__/bible-api.test.ts` - Bible verse validation & fetching
- `src/components/__tests__/AuthGuard.test.tsx` - Component tests
- `src/components/__tests__/SearchableDropdown.test.tsx` - Complex component tests
- `src/app/api/__tests__/auth.test.ts` - API route tests
- `src/app/api/__tests__/bible-verse.test.ts` - Bible verse API tests
- `src/app/api/__tests__/records-autocreate.test.ts` - Auto-create verses on recording

## Test Coverage for New Features

### Bible Verse System

**Validation** (`bible-api.test.ts`):
- ✅ Format validation (John 3:16, Psalm 23:1-6)
- ✅ Book name validation (including abbreviations)
- ✅ Verse existence validation (prevents impossible verses like "John 50:1")
- ✅ Autocomplete suggestions

**API Endpoint** (`bible-verse.test.ts`):
- ✅ Fetch verses in multiple versions (ESV, NIV, KJV, etc.)
- ✅ Handle invalid references
- ✅ URL encoding support

**Auto-Creation** (`records-autocreate.test.ts`):
- ✅ Create memory items when recording new verses
- ✅ Fetch from Bible API and store NIV text
- ✅ Calculate appropriate points for verse ranges
- ✅ Handle API failures gracefully

## Continuous Integration

Tests should run automatically in CI/CD. Add to your workflow:

```yaml
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage
```

## Troubleshooting

**"Cannot find module" errors**
- Make sure `moduleNameMapper` in `jest.config.js` matches your `tsconfig.json` paths

**"window is not defined"**
- Make sure `testEnvironment: 'jest-environment-jsdom'` is set

**"Module not found" errors**
- Check that all dependencies are installed
- Verify `jest.setup.js` is properly configured

