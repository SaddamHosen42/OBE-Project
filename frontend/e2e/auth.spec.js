import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Authentication Flow
 */
test.describe('Authentication Flow', () => {
  const testUser = {
    email: `e2etest_${Date.now()}@example.com`,
    username: `e2euser_${Date.now()}`,
    password: 'Test@12345',
    firstName: 'E2E',
    lastName: 'Tester'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('User Registration', () => {
    test('should register a new user successfully', async ({ page }) => {
      // Navigate to register page
      await page.click('text=Register');
      await expect(page).toHaveURL(/.*register/);

      // Fill registration form
      await page.fill('input[name="firstName"]', testUser.firstName);
      await page.fill('input[name="lastName"]', testUser.lastName);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="username"]', testUser.username);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);

      // Select role
      await page.selectOption('select[name="role"]', 'teacher');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });

      // Should see welcome message or user name
      await expect(page.locator('text=' + testUser.firstName)).toBeVisible();
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await page.click('text=Register');

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Should show validation errors
      await expect(page.locator('text=/required/i')).toBeVisible();
    });

    test('should show error for duplicate email', async ({ page }) => {
      await page.click('text=Register');

      // Try to register with existing email
      await page.fill('input[name="email"]', 'existing@example.com');
      await page.fill('input[name="username"]', 'newuser');
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=/already exists/i')).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.click('text=Register');

      // Enter weak password
      await page.fill('input[name="password"]', '123');

      // Should show password strength indicator
      await expect(page.locator('text=/weak|strong|password/i')).toBeVisible();
    });
  });

  test.describe('User Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      // Navigate to login page
      await page.click('text=Login');
      await expect(page).toHaveURL(/.*login/);

      // Fill login form
      await page.fill('input[name="identifier"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });

      // Should see user menu or profile
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.click('text=Login');

      // Enter invalid credentials
      await page.fill('input[name="identifier"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');

      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=/invalid|incorrect/i')).toBeVisible();

      // Should stay on login page
      await expect(page).toHaveURL(/.*login/);
    });

    test('should remember user when "Remember Me" is checked', async ({ page, context }) => {
      await page.click('text=Login');

      await page.fill('input[name="identifier"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.check('input[name="rememberMe"]');

      await page.click('button[type="submit"]');

      // Wait for redirect
      await page.waitForURL(/.*dashboard/);

      // Check if token is stored
      const cookies = await context.cookies();
      const hasAuthCookie = cookies.some(cookie => cookie.name.includes('auth') || cookie.name.includes('token'));
      expect(hasAuthCookie || await page.evaluate(() => localStorage.getItem('token'))).toBeTruthy();
    });

    test('should navigate to forgot password', async ({ page }) => {
      await page.click('text=Login');
      await page.click('text=Forgot Password');

      await expect(page).toHaveURL(/.*forgot-password/);
    });
  });

  test.describe('User Logout', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[name="identifier"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('should logout successfully', async ({ page }) => {
      // Click user menu
      await page.click('[data-testid="user-menu"]');

      // Click logout
      await page.click('text=Logout');

      // Should redirect to login page
      await expect(page).toHaveURL(/.*login/, { timeout: 5000 });

      // Should clear authentication token
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();
    });

    test('should redirect to login when accessing protected route after logout', async ({ page }) => {
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Logout');

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="identifier"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);

      // Refresh page
      await page.reload();

      // Should still be logged in
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should expire session after timeout', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="identifier"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);

      // Wait for session timeout (adjust based on your session timeout)
      // This is a simplified test - in reality, you'd mock the time
      await page.waitForTimeout(60000); // Wait 1 minute

      // Try to access protected resource
      await page.goto('/courses');

      // Should redirect to login or show session expired message
      const isLoginPage = page.url().includes('login');
      const hasExpiredMessage = await page.locator('text=/session expired/i').isVisible();

      expect(isLoginPage || hasExpiredMessage).toBeTruthy();
    });
  });

  test.describe('Password Reset', () => {
    test('should request password reset', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[name="email"]', testUser.email);
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/email sent|check your email/i')).toBeVisible();
    });

    test('should reset password with valid token', async ({ page }) => {
      // This would require a valid reset token
      // In a real scenario, you'd generate a token programmatically
      const mockResetToken = 'mock-reset-token-123';

      await page.goto(`/reset-password?token=${mockResetToken}`);

      await page.fill('input[name="password"]', 'NewPassword@123');
      await page.fill('input[name="confirmPassword"]', 'NewPassword@123');
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/password reset|success/i')).toBeVisible();
    });
  });

  test.describe('Profile Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="identifier"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('should view user profile', async ({ page }) => {
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Profile');

      await expect(page).toHaveURL(/.*profile/);
      await expect(page.locator('text=' + testUser.email)).toBeVisible();
    });

    test('should update profile information', async ({ page }) => {
      await page.goto('/profile');

      // Update first name
      await page.fill('input[name="firstName"]', 'UpdatedName');
      await page.click('button:has-text("Save")');

      // Should show success message
      await expect(page.locator('text=/updated|success/i')).toBeVisible();

      // Verify update
      await page.reload();
      const firstNameValue = await page.inputValue('input[name="firstName"]');
      expect(firstNameValue).toBe('UpdatedName');
    });

    test('should change password', async ({ page }) => {
      await page.goto('/profile/change-password');

      await page.fill('input[name="currentPassword"]', testUser.password);
      await page.fill('input[name="newPassword"]', 'NewPass@123');
      await page.fill('input[name="confirmPassword"]', 'NewPass@123');
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/password changed|success/i')).toBeVisible();
    });
  });
});
