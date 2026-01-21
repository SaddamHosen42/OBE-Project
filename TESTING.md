# Testing Guide for OBE Project

This document provides comprehensive information about the testing infrastructure and practices for the OBE Management System.

## Table of Contents

1. [Frontend Tests](#frontend-tests)
2. [Backend Tests](#backend-tests)
3. [E2E Tests](#e2e-tests)
4. [Running Tests](#running-tests)
5. [Test Coverage](#test-coverage)
6. [Writing New Tests](#writing-new-tests)

---

## Frontend Tests

The frontend uses **Vitest** and **React Testing Library** for unit and integration testing.

### Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── __tests__/
│   │   │   │   ├── Pagination.test.jsx
│   │   │   │   ├── DataTable.test.jsx
│   │   │   │   └── ...
│   │   ├── form/
│   │   │   ├── __tests__/
│   │   │   │   ├── FormInput.test.jsx
│   │   │   │   ├── FormSelect.test.jsx
│   │   │   │   └── ...
│   │   └── ...
│   ├── hooks/
│   │   ├── __tests__/
│   │   │   ├── useAuth.test.js
│   │   │   ├── useLogin.test.js
│   │   │   └── ...
│   └── test/
│       ├── setup.js
│       └── testUtils.jsx
```

### Component Tests

Component tests verify that UI components render correctly and handle user interactions properly.

**Example:**
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormInput from '../FormInput';

describe('FormInput Component', () => {
  it('renders input with label', () => {
    render(<FormInput label="Email" name="email" value="" onChange={vi.fn()} />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
});
```

### Hook Tests

Hook tests verify custom React hooks functionality using `renderHook` from React Testing Library.

**Example:**
```javascript
import { renderHook } from '@testing-library/react';
import { QueryWrapper } from '../../test/testUtils';
import useAuth from '../useAuth';

describe('useAuth Hook', () => {
  it('returns authentication state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: QueryWrapper });
    expect(result.current).toHaveProperty('isAuthenticated');
  });
});
```

### Test Utilities

Located in `src/test/testUtils.jsx`, these utilities provide:
- Query client wrappers
- Router wrappers
- Mock localStorage
- Custom render functions with providers

---

## Backend Tests

The backend uses **Jest** for unit and integration testing.

### Test Structure

```
backend/
├── __tests__/
│   ├── integration/
│   │   ├── auth.integration.test.js
│   │   ├── courses.integration.test.js
│   │   ├── attainment.integration.test.js
│   │   └── database.integration.test.js
│   ├── controllers/
│   └── models/
```

### Integration Tests

Integration tests verify API endpoints and database operations work correctly together.

**Example:**
```javascript
const request = require('supertest');
const app = require('../../config/app');

describe('Authentication API', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Test@123' })
      .expect(201);
    
    expect(response.body.success).toBe(true);
  });
});
```

### Database Tests

Database tests verify:
- Database connectivity
- Transaction handling
- Data integrity constraints
- Query performance
- Migrations

---

## E2E Tests

End-to-end tests use **Playwright** to test complete user workflows.

### Test Structure

```
frontend/
├── e2e/
│   ├── auth.spec.js
│   ├── courses.spec.js
│   ├── marks.spec.js
│   └── attainment.spec.js
└── playwright.config.js
```

### E2E Test Scenarios

#### Authentication Flow
- User registration
- Login/logout
- Password reset
- Session management
- Profile management

#### Course Management Flow
- Create/edit/delete courses
- View course details
- Manage CLOs
- Create course offerings
- Generate reports

#### Marks Entry Flow
- Navigate to marks entry
- Enter marks for assessments
- Bulk upload via CSV
- Edit and verify marks
- View marks statistics
- Export marks data

#### Attainment Calculation Flow
- Calculate CLO attainment
- Calculate PLO attainment
- Configure thresholds
- Create action plans
- Generate reports
- View dashboard

---

## Running Tests

### Frontend Unit Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Backend Unit Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth.integration.test.js

# Generate coverage report
npm test -- --coverage
```

### E2E Tests

```bash
cd frontend

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/auth.spec.js

# Run tests on specific browser
npx playwright test --project=chromium
```

---

## Test Coverage

### Coverage Thresholds

**Frontend (Vitest):**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**Backend (Jest):**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Viewing Coverage Reports

**Frontend:**
```bash
cd frontend
npm run test:coverage
# Open frontend/coverage/index.html in browser
```

**Backend:**
```bash
cd backend
npm test -- --coverage
# Open backend/coverage/index.html in browser
```

---

## Writing New Tests

### Component Test Template

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<YourComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Integration Test Template

```javascript
const request = require('supertest');
const app = require('../../config/app');
const db = require('../../config/database');

describe('Your API Endpoint', () => {
  beforeAll(async () => {
    await db.raw('SELECT 1');
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should perform expected operation', async () => {
    const response = await request(app)
      .post('/api/your-endpoint')
      .send({ data: 'value' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

### E2E Test Template

```javascript
import { test, expect } from '@playwright/test';

test.describe('Your Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login or setup as needed
  });

  test('should complete user workflow', async ({ page }) => {
    // Navigate
    await page.click('text=Your Feature');
    
    // Interact
    await page.fill('input[name="field"]', 'value');
    await page.click('button[type="submit"]');
    
    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

---

## Best Practices

### General
1. Write descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Test user behavior, not implementation details
4. Keep tests independent and isolated
5. Use test data builders for complex objects

### Component Tests
1. Test component output, not internals
2. Use user events instead of fireEvent
3. Query by accessible roles and labels
4. Mock external dependencies
5. Test error states and edge cases

### Integration Tests
1. Use test database or transactions
2. Clean up test data after tests
3. Test happy path and error scenarios
4. Verify response status and structure
5. Test authentication and authorization

### E2E Tests
1. Test critical user journeys
2. Use Page Object Model for complex pages
3. Handle async operations properly
4. Take screenshots on failures
5. Keep tests deterministic and reliable

---

## Continuous Integration

Tests are automatically run on:
- Pull requests
- Commits to main branch
- Before deployments

### CI Pipeline
1. Install dependencies
2. Run linting
3. Run unit tests (frontend & backend)
4. Run integration tests
5. Run E2E tests
6. Generate coverage reports
7. Upload artifacts

---

## Troubleshooting

### Common Issues

**Tests timing out:**
- Increase timeout in test configuration
- Check for unresolved promises
- Verify async/await usage

**Flaky E2E tests:**
- Use proper wait conditions
- Avoid hard-coded delays
- Check for race conditions

**Coverage not updating:**
- Clear coverage cache
- Verify file patterns in config
- Check if files are excluded

### Debug Commands

```bash
# Frontend - Debug specific test
npm test -- FormInput.test.jsx --no-coverage

# Backend - Debug with Node inspector
node --inspect-brk node_modules/.bin/jest auth.integration.test.js

# E2E - Debug mode with browser dev tools
npm run test:e2e:debug
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation if needed

For questions or issues, contact the development team.
