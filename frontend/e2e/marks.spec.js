import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Marks Entry Flow
 */
test.describe('Marks Entry Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('input[name="identifier"]', 'teacher@example.com');
    await page.fill('input[name="password"]', 'Teacher@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test.describe('Navigate to Marks Entry', () => {
    test('should navigate to marks entry page', async ({ page }) => {
      await page.click('text=Marks');
      await expect(page).toHaveURL(/.*marks/);

      // Should see course offerings list
      await expect(page.locator('text=Course Offerings')).toBeVisible();
    });

    test('should select course offering', async ({ page }) => {
      await page.goto('/marks');

      // Select offering
      await page.locator('[data-testid="offering-card"]').first().click();

      // Should see enrolled students
      await expect(page.locator('text=Enrolled Students')).toBeVisible();
    });
  });

  test.describe('Enter Marks', () => {
    test('should enter marks for assessment', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();

      // Select assessment
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Enter marks for first student
      const firstStudentRow = page.locator('[data-testid="student-row"]').first();
      await firstStudentRow.locator('input[name="marks"]').fill('85');

      // Save marks
      await page.click('button:has-text("Save Marks")');

      // Should show success message
      await expect(page.locator('text=/saved|success/i')).toBeVisible();
    });

    test('should validate marks range', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Try to enter marks exceeding maximum
      const firstStudentRow = page.locator('[data-testid="student-row"]').first();
      await firstStudentRow.locator('input[name="marks"]').fill('150'); // Assuming max is 100

      // Should show validation error
      await expect(page.locator('text=/exceeds maximum|invalid/i')).toBeVisible();
    });

    test('should enter marks for multiple students', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Enter marks for multiple students
      const studentRows = await page.locator('[data-testid="student-row"]').all();
      const marksData = [85, 90, 78, 88, 92];

      for (let i = 0; i < Math.min(studentRows.length, marksData.length); i++) {
        await studentRows[i].locator('input[name="marks"]').fill(marksData[i].toString());
      }

      // Save all marks
      await page.click('button:has-text("Save All")');

      // Should show success message
      await expect(page.locator('text=/saved|success/i')).toBeVisible();
    });

    test('should handle absent students', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Mark student as absent
      const firstStudentRow = page.locator('[data-testid="student-row"]').first();
      await firstStudentRow.locator('input[name="absent"]').check();

      // Marks field should be disabled
      const marksInput = firstStudentRow.locator('input[name="marks"]');
      await expect(marksInput).toBeDisabled();

      // Save
      await page.click('button:has-text("Save Marks")');
      await expect(page.locator('text=/saved|success/i')).toBeVisible();
    });
  });

  test.describe('Bulk Marks Entry', () => {
    test('should upload marks via CSV', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();

      // Click bulk upload
      await page.click('button:has-text("Bulk Upload")');

      // Upload CSV file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'marks.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('student_id,marks\n1,85\n2,90\n3,78')
      });

      // Process upload
      await page.click('button:has-text("Upload")');

      // Should show preview
      await expect(page.locator('text=Preview')).toBeVisible();

      // Confirm upload
      await page.click('button:has-text("Confirm")');

      // Should show success message
      await expect(page.locator('text=/uploaded|success/i')).toBeVisible();
    });

    test('should validate CSV format', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.click('button:has-text("Bulk Upload")');

      // Upload invalid CSV
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'invalid.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('invalid,format\n')
      });

      await page.click('button:has-text("Upload")');

      // Should show validation error
      await expect(page.locator('text=/invalid format|error/i')).toBeVisible();
    });

    test('should download marks template', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.click('button:has-text("Bulk Upload")');

      // Download template
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Download Template');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/template.*\.csv/i);
    });
  });

  test.describe('Edit Marks', () => {
    test('should edit existing marks', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Find student with marks and edit
      const studentRow = page.locator('[data-testid="student-row"]').first();
      const marksInput = studentRow.locator('input[name="marks"]');
      
      // Clear and enter new marks
      await marksInput.clear();
      await marksInput.fill('95');

      // Save
      await page.click('button:has-text("Save Marks")');

      // Should show success message
      await expect(page.locator('text=/updated|success/i')).toBeVisible();
    });

    test('should require confirmation for marks modification', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Edit marks
      const studentRow = page.locator('[data-testid="student-row"]').first();
      await studentRow.locator('input[name="marks"]').fill('95');

      // Save
      await page.click('button:has-text("Save Marks")');

      // Should show confirmation dialog
      await expect(page.locator('text=/confirm|are you sure/i')).toBeVisible();

      // Confirm
      await page.click('button:has-text("Confirm")');

      // Should show success message
      await expect(page.locator('text=/updated|success/i')).toBeVisible();
    });
  });

  test.describe('Marks Statistics', () => {
    test('should display marks statistics', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Should see statistics panel
      await expect(page.locator('[data-testid="statistics-panel"]')).toBeVisible();

      // Should show average, highest, lowest
      await expect(page.locator('text=/average/i')).toBeVisible();
      await expect(page.locator('text=/highest/i')).toBeVisible();
      await expect(page.locator('text=/lowest/i')).toBeVisible();
    });

    test('should display marks distribution chart', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Click view statistics/charts
      await page.click('button:has-text("View Statistics")');

      // Should see distribution chart
      await expect(page.locator('canvas')).toBeVisible();
    });
  });

  test.describe('Marks Verification', () => {
    test('should flag marks for verification', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Enter marks
      const studentRow = page.locator('[data-testid="student-row"]').first();
      await studentRow.locator('input[name="marks"]').fill('85');

      // Flag for verification
      await studentRow.locator('button[aria-label="Flag"]').click();
      await page.fill('textarea[name="comment"]', 'Please verify this mark');
      await page.click('button:has-text("Submit")');

      // Should show flagged indicator
      await expect(studentRow.locator('[data-testid="flagged-icon"]')).toBeVisible();
    });

    test('should verify and approve marks', async ({ page }) => {
      // Login as admin/coordinator
      await page.goto('/login');
      await page.fill('input[name="identifier"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'Admin@123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);

      // Go to marks verification
      await page.goto('/marks/verification');

      // Should see pending verifications
      await expect(page.locator('[data-testid="pending-verifications"]')).toBeVisible();

      // Approve first verification
      await page.locator('[data-testid="verification-item"]').first()
        .locator('button:has-text("Approve")').click();

      // Should show success message
      await expect(page.locator('text=/approved|success/i')).toBeVisible();
    });
  });

  test.describe('Marks Export', () => {
    test('should export marks to Excel', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();

      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export")');
      await page.click('text=Excel');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
    });

    test('should export marks to PDF', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export")');
      await page.click('text=PDF');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });
  });

  test.describe('Marks History', () => {
    test('should view marks change history', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Click history for a student
      const studentRow = page.locator('[data-testid="student-row"]').first();
      await studentRow.locator('button[aria-label="History"]').click();

      // Should see change history
      await expect(page.locator('text=Change History')).toBeVisible();
      await expect(page.locator('[data-testid="history-item"]')).toBeVisible();
    });

    test('should show who modified marks', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      const studentRow = page.locator('[data-testid="student-row"]').first();
      await studentRow.locator('button[aria-label="History"]').click();

      // Should show user who made changes
      await expect(page.locator('text=/modified by|changed by/i')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    });
  });

  test.describe('Question-wise Marks', () => {
    test('should enter question-wise marks', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });

      // Click detailed marks entry
      await page.click('button:has-text("Question-wise Entry")');

      // Should see question list
      await expect(page.locator('[data-testid="question-list"]')).toBeVisible();

      // Enter marks for each question
      const firstStudent = page.locator('[data-testid="student-section"]').first();
      const questions = await firstStudent.locator('[data-testid="question-marks"]').all();

      for (let i = 0; i < questions.length; i++) {
        await questions[i].fill((i + 5).toString());
      }

      // Save
      await page.click('button:has-text("Save")');
      await expect(page.locator('text=/saved|success/i')).toBeVisible();
    });

    test('should auto-calculate total from question marks', async ({ page }) => {
      await page.goto('/marks');
      await page.locator('[data-testid="offering-card"]').first().click();
      await page.selectOption('select[name="assessmentId"]', { index: 1 });
      await page.click('button:has-text("Question-wise Entry")');

      const firstStudent = page.locator('[data-testid="student-section"]').first();
      
      // Enter marks for questions
      await firstStudent.locator('[data-testid="question-marks"]').nth(0).fill('8');
      await firstStudent.locator('[data-testid="question-marks"]').nth(1).fill('7');

      // Total should auto-update
      const totalField = firstStudent.locator('[data-testid="total-marks"]');
      await expect(totalField).toHaveValue('15');
    });
  });
});
