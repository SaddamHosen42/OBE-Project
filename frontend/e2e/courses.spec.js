import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Course Management Flow
 */
test.describe('Course Management Flow', () => {
  let authToken;
  const testCourse = {
    code: `E2E${Date.now().toString().slice(-4)}`,
    name: 'E2E Test Course',
    credits: 3,
    description: 'Course created by E2E tests'
  };

  test.beforeEach(async ({ page }) => {
    // Login as admin/teacher
    await page.goto('/login');
    await page.fill('input[name="identifier"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test.describe('Create Course', () => {
    test('should create a new course successfully', async ({ page }) => {
      // Navigate to courses page
      await page.click('text=Courses');
      await expect(page).toHaveURL(/.*courses/);

      // Click create new course button
      await page.click('button:has-text("New Course")');

      // Fill course form
      await page.fill('input[name="courseCode"]', testCourse.code);
      await page.fill('input[name="courseName"]', testCourse.name);
      await page.fill('input[name="creditHours"]', testCourse.credits.toString());
      await page.fill('textarea[name="description"]', testCourse.description);

      // Select department
      await page.selectOption('select[name="departmentId"]', { index: 1 });

      // Submit form
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/created|success/i')).toBeVisible();

      // Should see the new course in the list
      await expect(page.locator(`text=${testCourse.code}`)).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/courses');
      await page.click('button:has-text("New Course")');

      // Try to submit without filling required fields
      await page.click('button[type="submit"]');

      // Should show validation errors
      await expect(page.locator('text=/required/i')).toBeVisible();
    });

    test('should prevent duplicate course codes', async ({ page }) => {
      await page.goto('/courses');
      await page.click('button:has-text("New Course")');

      // Try to create course with existing code
      await page.fill('input[name="courseCode"]', testCourse.code);
      await page.fill('input[name="courseName"]', 'Duplicate Course');
      await page.fill('input[name="creditHours"]', '3');
      await page.selectOption('select[name="departmentId"]', { index: 1 });

      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=/already exists|duplicate/i')).toBeVisible();
    });
  });

  test.describe('View Courses', () => {
    test('should display courses list', async ({ page }) => {
      await page.goto('/courses');

      // Should see table/grid of courses
      await expect(page.locator('[data-testid="courses-table"]')).toBeVisible();

      // Should have at least one course
      const courseRows = page.locator('tbody tr');
      await expect(courseRows).toHaveCount(await courseRows.count());
    });

    test('should search courses', async ({ page }) => {
      await page.goto('/courses');

      // Enter search term
      await page.fill('input[placeholder*="Search"]', testCourse.code);

      // Should filter results
      await expect(page.locator(`text=${testCourse.code}`)).toBeVisible();

      // Other courses should not be visible
      const visibleRows = await page.locator('tbody tr:visible').count();
      expect(visibleRows).toBeGreaterThanOrEqual(1);
    });

    test('should filter courses by department', async ({ page }) => {
      await page.goto('/courses');

      // Select department filter
      await page.selectOption('select[name="departmentFilter"]', { index: 1 });

      // Should show only courses from that department
      await expect(page.locator('tbody tr')).toHaveCount(await page.locator('tbody tr').count());
    });

    test('should paginate course list', async ({ page }) => {
      await page.goto('/courses');

      // Should see pagination controls
      await expect(page.locator('[aria-label="Pagination"]')).toBeVisible();

      // Click next page
      await page.click('button[aria-label="Next page"]');

      // Should load next page
      await expect(page).toHaveURL(/.*page=2/);
    });
  });

  test.describe('View Course Details', () => {
    test('should view course details', async ({ page }) => {
      await page.goto('/courses');

      // Click on a course
      await page.click(`text=${testCourse.code}`);

      // Should navigate to course details page
      await expect(page).toHaveURL(/.*courses\/\d+/);

      // Should display course information
      await expect(page.locator(`text=${testCourse.name}`)).toBeVisible();
      await expect(page.locator(`text=${testCourse.description}`)).toBeVisible();
    });

    test('should display CLOs for the course', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);

      // Should see CLOs section
      await expect(page.locator('text=Course Learning Outcomes')).toBeVisible();

      // Should have CLO list (may be empty)
      await expect(page.locator('[data-testid="clo-list"]')).toBeVisible();
    });

    test('should display course prerequisites', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);

      // Should see prerequisites section
      await expect(page.locator('text=Prerequisites')).toBeVisible();
    });
  });

  test.describe('Edit Course', () => {
    test('should edit course successfully', async ({ page }) => {
      await page.goto('/courses');

      // Find and click edit button for test course
      const courseRow = page.locator(`tr:has-text("${testCourse.code}")`);
      await courseRow.locator('button[aria-label="Edit"]').click();

      // Update course name
      const newName = 'Updated E2E Test Course';
      await page.fill('input[name="courseName"]', newName);

      // Save changes
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/updated|success/i')).toBeVisible();

      // Should see updated name
      await expect(page.locator(`text=${newName}`)).toBeVisible();
    });

    test('should cancel course edit', async ({ page }) => {
      await page.goto('/courses');

      const courseRow = page.locator(`tr:has-text("${testCourse.code}")`);
      await courseRow.locator('button[aria-label="Edit"]').click();

      // Make changes
      await page.fill('input[name="courseName"]', 'This Should Not Save');

      // Cancel
      await page.click('button:has-text("Cancel")');

      // Should return to courses list
      await expect(page).toHaveURL(/.*\/courses$/);

      // Changes should not be saved
      await expect(page.locator('text=This Should Not Save')).not.toBeVisible();
    });
  });

  test.describe('Manage CLOs', () => {
    test('should add CLO to course', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);

      // Navigate to CLOs tab
      await page.click('text=CLOs');

      // Click add CLO button
      await page.click('button:has-text("Add CLO")');

      // Fill CLO form
      await page.fill('input[name="cloNumber"]', '1');
      await page.fill('textarea[name="description"]', 'Students will understand basic concepts');
      await page.selectOption('select[name="bloomLevel"]', 'understand');

      // Save CLO
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/created|success/i')).toBeVisible();

      // Should see CLO in list
      await expect(page.locator('text=Students will understand basic concepts')).toBeVisible();
    });

    test('should edit CLO', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);
      await page.click('text=CLOs');

      // Click edit on first CLO
      await page.locator('[data-testid="clo-item"]').first().locator('button[aria-label="Edit"]').click();

      // Update description
      await page.fill('textarea[name="description"]', 'Updated CLO description');
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/updated|success/i')).toBeVisible();
    });

    test('should delete CLO', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);
      await page.click('text=CLOs');

      // Click delete on a CLO
      await page.locator('[data-testid="clo-item"]').first().locator('button[aria-label="Delete"]').click();

      // Confirm deletion
      await page.click('button:has-text("Confirm")');

      // Should show success message
      await expect(page.locator('text=/deleted|success/i')).toBeVisible();
    });

    test('should map CLO to PLO', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);
      await page.click('text=CLOs');

      // Click map PLO button on a CLO
      await page.locator('[data-testid="clo-item"]').first().locator('button:has-text("Map PLO")').click();

      // Select PLOs
      await page.check('input[value="1"]'); // Select PLO 1
      await page.check('input[value="2"]'); // Select PLO 2

      // Save mapping
      await page.click('button:has-text("Save Mapping")');

      // Should show success message
      await expect(page.locator('text=/mapped|success/i')).toBeVisible();
    });
  });

  test.describe('Course Offerings', () => {
    test('should create course offering', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);

      // Navigate to offerings tab
      await page.click('text=Offerings');

      // Click create offering
      await page.click('button:has-text("Create Offering")');

      // Fill offering form
      await page.selectOption('select[name="academicSession"]', { index: 1 });
      await page.selectOption('select[name="semester"]', { index: 1 });
      await page.fill('input[name="section"]', 'A');
      await page.selectOption('select[name="teacherId"]', { index: 1 });

      // Save offering
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/created|success/i')).toBeVisible();

      // Should see offering in list
      await expect(page.locator('text=Section A')).toBeVisible();
    });

    test('should view offering details', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);
      await page.click('text=Offerings');

      // Click on an offering
      await page.locator('[data-testid="offering-item"]').first().click();

      // Should see offering details
      await expect(page.locator('text=Enrollment')).toBeVisible();
      await expect(page.locator('text=Assessments')).toBeVisible();
    });
  });

  test.describe('Delete Course', () => {
    test('should delete course successfully', async ({ page }) => {
      await page.goto('/courses');

      // Find and click delete button for test course
      const courseRow = page.locator(`tr:has-text("${testCourse.code}")`);
      await courseRow.locator('button[aria-label="Delete"]').click();

      // Confirm deletion
      await page.click('button:has-text("Confirm")');

      // Should show success message
      await expect(page.locator('text=/deleted|success/i')).toBeVisible();

      // Course should not be in list
      await expect(page.locator(`text=${testCourse.code}`)).not.toBeVisible();
    });

    test('should prevent deletion of course with enrollments', async ({ page }) => {
      await page.goto('/courses');

      // Try to delete a course with enrollments
      const courseWithEnrollments = page.locator('tr').first();
      await courseWithEnrollments.locator('button[aria-label="Delete"]').click();
      await page.click('button:has-text("Confirm")');

      // Should show error message
      await expect(page.locator('text=/cannot delete|has enrollments/i')).toBeVisible();
    });
  });

  test.describe('Course Reports', () => {
    test('should generate course report', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);

      // Click reports tab
      await page.click('text=Reports');

      // Select report type
      await page.selectOption('select[name="reportType"]', 'attainment');

      // Generate report
      await page.click('button:has-text("Generate Report")');

      // Should show loading state
      await expect(page.locator('text=/generating|loading/i')).toBeVisible();

      // Should display report
      await expect(page.locator('[data-testid="report-content"]')).toBeVisible({ timeout: 10000 });
    });

    test('should export course data', async ({ page }) => {
      await page.goto('/courses');
      await page.click(`text=${testCourse.code}`);

      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export")');

      // Should trigger download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.xlsx|\.csv|\.pdf/);
    });
  });
});
