# Middleware Documentation

This directory contains authentication and authorization middleware for the OBE Project backend.

## Table of Contents
- [Authentication Middleware](#authentication-middleware)
- [Role Middleware](#role-middleware)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Authentication Middleware

### `authenticate`
Verifies JWT token and attaches user information to the request object. This middleware should be used on all protected routes.

**Features:**
- Extracts JWT token from Authorization header
- Verifies token validity and expiration
- Fetches user from database
- Checks if user is active
- Attaches user info to `req.user` and full user object to `req.fullUser`

**Error Responses:**
- 401: No token, invalid token, or expired token
- 403: User account is deactivated
- 500: Internal server error

### `optionalAuthenticate`
Attempts to authenticate but doesn't fail if no token is provided. Useful for routes that have different behavior for authenticated vs unauthenticated users.

### `verifyRefreshToken`
Verifies refresh tokens for token refresh endpoints.

## Role Middleware

### `authorize(...roles)`
Main authorization function that checks if user has one of the required roles.

```javascript
authorize('admin')
authorize('teacher', 'admin')
authorize(['student', 'teacher'])
```

### Convenience Functions

#### Single Role Checks
- `isAdmin` - Admin only
- `isTeacher` - Teacher only
- `isStudent` - Student only
- `isDepartmentHead` - Department Head only
- `isDean` - Dean only

#### Multiple Role Checks
- `isAdminOrTeacher` - Admin or Teacher
- `isAdminOrDepartmentHead` - Admin or Department Head
- `isAdministrative` - Admin, Department Head, or Dean

### `isOwnerOrAdmin(getResourceOwnerId)`
Checks if the user owns the resource or is an admin. Takes a function that extracts the owner ID from the request.

```javascript
isOwnerOrAdmin((req) => req.params.userId)
```

### `hasPermission(...permissions)`
Granular permission-based authorization. Checks if user's role has the required permissions.

**Available Permissions:**
- Admin: manage_users, manage_courses, manage_departments, manage_faculty, manage_students, view_reports, manage_assessments, manage_outcomes, manage_settings
- Teacher: manage_courses, manage_assessments, view_students, grade_students, manage_outcomes, view_reports
- Student: view_courses, view_grades, view_assessments, submit_assignments
- Department Head: manage_courses, manage_faculty, view_reports, manage_assessments, manage_outcomes, view_students
- Dean: manage_departments, view_reports, manage_faculty, view_courses, view_students, manage_outcomes

## Usage Examples

### Basic Protected Route
```javascript
const { authenticate } = require('./middlewares');

router.get('/profile', authenticate, (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

### Admin-Only Route
```javascript
const { authenticate, isAdmin } = require('./middlewares');

router.delete('/users/:id', authenticate, isAdmin, async (req, res) => {
  // Only admins can access this route
});
```

### Multiple Roles
```javascript
const { authenticate, authorize } = require('./middlewares');

router.get('/courses', 
  authenticate, 
  authorize('teacher', 'admin', 'department_head'),
  courseController.list
);

// Or using convenience function
router.get('/courses', authenticate, isAdminOrTeacher, courseController.list);
```

### Owner or Admin Access
```javascript
const { authenticate, isOwnerOrAdmin } = require('./middlewares');

router.put('/students/:studentId', 
  authenticate,
  isOwnerOrAdmin((req) => req.params.studentId),
  studentController.update
);
```

### Permission-Based Authorization
```javascript
const { authenticate, hasPermission } = require('./middlewares');

router.post('/assessments', 
  authenticate,
  hasPermission('manage_assessments'),
  assessmentController.create
);
```

### Optional Authentication
```javascript
const { optionalAuthenticate } = require('./middlewares');

router.get('/public-courses', optionalAuthenticate, (req, res) => {
  // req.user will be null if not authenticated
  // Different response based on authentication status
  if (req.user) {
    // Return personalized course list
  } else {
    // Return public course list
  }
});
```

### Token Refresh
```javascript
const { verifyRefreshToken } = require('./middlewares');

router.post('/auth/refresh', verifyRefreshToken, authController.refreshToken);
```

### Chaining Multiple Middleware
```javascript
const { authenticate, authorize, hasPermission } = require('./middlewares');

router.post('/grades/:courseId',
  authenticate,                           // First authenticate
  authorize('teacher', 'admin'),          // Then check role
  hasPermission('grade_students'),        // Then check permission
  gradesController.submit
);
```

## Best Practices

1. **Always authenticate first**: Use `authenticate` before any authorization middleware
   ```javascript
   router.get('/admin', authenticate, isAdmin, controller);  // ✅ Correct
   router.get('/admin', isAdmin, authenticate, controller);  // ❌ Wrong order
   ```

2. **Use convenience functions**: Prefer `isAdmin` over `authorize('admin')` for readability
   ```javascript
   router.get('/admin', authenticate, isAdmin, controller);           // ✅ Better
   router.get('/admin', authenticate, authorize('admin'), controller); // ✅ Works but verbose
   ```

3. **Combine related middleware**: Chain middleware in logical order
   ```javascript
   router.use('/api/admin/*', authenticate, isAdmin);  // Apply to all admin routes
   ```

4. **Handle authorization errors**: Frontend should handle 401 (authentication) and 403 (authorization) differently
   - 401: Redirect to login
   - 403: Show "Access Denied" message

5. **Use permission-based auth for complex scenarios**: When role-based auth is too coarse
   ```javascript
   router.post('/special-report', authenticate, hasPermission('view_reports'), controller);
   ```

6. **Secure sensitive routes**: Always protect routes that modify data
   ```javascript
   router.post('/users', authenticate, isAdmin, userController.create);
   router.put('/users/:id', authenticate, isAdmin, userController.update);
   router.delete('/users/:id', authenticate, isAdmin, userController.delete);
   ```

## Error Handling

All middleware functions return proper HTTP status codes:
- **401 Unauthorized**: Missing, invalid, or expired token
- **403 Forbidden**: Valid token but insufficient permissions
- **500 Internal Server Error**: Server-side errors

Response format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE",           // Optional, in some cases
  "requiredRoles": ["admin"],      // Optional, for authorization errors
  "userRole": "student"            // Optional, for authorization errors
}
```

## Testing

Example test cases:

```javascript
// Test authentication
it('should reject requests without token', async () => {
  const res = await request(app).get('/api/profile');
  expect(res.status).toBe(401);
});

// Test authorization
it('should reject non-admin users', async () => {
  const token = generateToken({ role: 'student' });
  const res = await request(app)
    .delete('/api/users/1')
    .set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(403);
});
```

## Security Considerations

1. **Token Storage**: Store JWT tokens securely on the client-side (httpOnly cookies or secure localStorage)
2. **Token Expiration**: Tokens have configurable expiration (default 7 days for access tokens, 30 days for refresh tokens)
3. **HTTPS**: Always use HTTPS in production to prevent token interception
4. **Token Refresh**: Implement token refresh mechanism for better UX
5. **Account Deactivation**: Middleware checks if user account is active before allowing access
6. **Rate Limiting**: Consider adding rate limiting middleware for authentication endpoints
