# Backend Tests

This directory contains the test suite for the OBE Management System backend.

## Structure

```
__tests__/
├── models/              # Model layer tests
│   ├── BaseModel.test.js
│   ├── User.test.js
│   ├── Course.test.js
│   ├── CourseLearningOutcome.test.js
│   ├── ProgramLearningOutcome.test.js
│   └── AssessmentComponent.test.js
└── controllers/         # Controller layer tests
    ├── AuthController.test.js
    ├── CourseController.test.js
    ├── CLOController.test.js
    ├── MarksController.test.js
    └── CLOAttainmentController.test.js
```

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest __tests__/models/User.test.js

# Run tests with verbose output
npx jest --verbose

# Update snapshots (if using)
npx jest --updateSnapshot
```

## Writing Tests

### Model Tests

Model tests should focus on:
- CRUD operations
- Data validation
- Business logic
- Relationships between models
- Query methods

Example:
```javascript
const Model = require('../../models/Model');
const db = require('../../config/database');

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('Model', () => {
  let model;

  beforeEach(() => {
    model = new Model();
    jest.clearAllMocks();
  });

  it('should create a new record', async () => {
    const mockData = { id: 1, name: 'Test' };
    db.execute.mockResolvedValue([{ insertId: 1 }]);
    db.query.mockResolvedValue([[mockData]]);

    const result = await model.create({ name: 'Test' });

    expect(result).toEqual(mockData);
  });
});
```

### Controller Tests

Controller tests should focus on:
- HTTP request/response handling
- Input validation
- Status codes
- Error handling
- Middleware integration

Example:
```javascript
const request = require('supertest');
const express = require('express');
const Controller = require('../../controllers/Controller');

describe('Controller', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get('/resource', Controller.index);
    jest.clearAllMocks();
  });

  it('should return 200 with data', async () => {
    const response = await request(app)
      .get('/resource')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });
});
```

## Mocking Strategy

### Database Mocking

```javascript
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));
```

### Model Mocking

```javascript
jest.mock('../../models/User');

User.mockImplementation(() => ({
  findById: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockCreatedUser)
}));
```

### Authentication Mocking

```javascript
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

jwt.sign.mockReturnValue('mock-token');
bcrypt.hash.mockResolvedValue('hashed-password');
```

## Test Patterns

### Testing Success Cases

```javascript
it('should successfully perform operation', async () => {
  // Arrange
  const input = { /* test data */ };
  Model.mockImplementation(() => ({
    method: jest.fn().mockResolvedValue(expectedResult)
  }));

  // Act
  const result = await operation(input);

  // Assert
  expect(result).toEqual(expectedResult);
  expect(mockMethod).toHaveBeenCalledWith(input);
});
```

### Testing Error Cases

```javascript
it('should handle errors gracefully', async () => {
  // Arrange
  Model.mockImplementation(() => ({
    method: jest.fn().mockRejectedValue(new Error('Database error'))
  }));

  // Act & Assert
  await expect(operation()).rejects.toThrow('Database error');
});
```

### Testing Validation

```javascript
it('should validate required fields', async () => {
  const response = await request(app)
    .post('/resource')
    .send({ /* missing required fields */ });

  expect(response.status).toBe(400);
  expect(response.body.message).toContain('required');
});
```

## Coverage Goals

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should clearly describe what they test
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mocking**: Mock external dependencies
5. **Cleanup**: Use `beforeEach` and `afterEach` hooks
6. **Realistic Data**: Use realistic test data
7. **Edge Cases**: Test boundary conditions
8. **Error Paths**: Test both success and failure scenarios

## Common Issues

### Mock Not Working
```javascript
// Make sure mocks are defined before imports
jest.mock('../../config/database');
const Model = require('../../models/Model');
```

### Tests Hanging
```javascript
// Add timeout or use forceExit in jest.config.js
jest.config.js:
  forceExit: true,
  testTimeout: 10000
```

### Database Connection Errors
```javascript
// Ensure database module is properly mocked
// Don't import database directly in tests
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Ensure tests are isolated and repeatable
3. Mock external dependencies
4. Test both success and error cases
5. Update this README if adding new patterns
6. Ensure coverage thresholds are maintained

---

For issues or questions, please refer to the main project documentation.
