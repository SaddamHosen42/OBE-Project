import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Attainment Calculation Flow
 */
test.describe('Attainment Calculation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin/coordinator
    await page.goto('/login');
    await page.fill('input[name="identifier"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test.describe('CLO Attainment', () => {
    test('should navigate to CLO attainment page', async ({ page }) => {
      await page.click('text=Attainment');
      await page.click('text=CLO Attainment');
      
      await expect(page).toHaveURL(/.*attainment.*clo/i);
      await expect(page.locator('text=CLO Attainment')).toBeVisible();
    });

    test('should calculate CLO attainment for a course', async ({ page }) => {
      await page.goto('/attainment/clo');

      // Select course
      await page.selectOption('select[name="courseId"]', { index: 1 });

      // Select offering
      await page.selectOption('select[name="offeringId"]', { index: 1 });

      // Click calculate button
      await page.click('button:has-text("Calculate Attainment")');

      // Should show loading state
      await expect(page.locator('text=/calculating|processing/i')).toBeVisible();

      // Should display results
      await expect(page.locator('[data-testid="attainment-results"]')).toBeVisible({ timeout: 10000 });

      // Should show attainment percentages
      await expect(page.locator('[data-testid="clo-percentage"]')).toBeVisible();
    });

    test('should display CLO attainment levels', async ({ page }) => {
      await page.goto('/attainment/clo');
      await page.selectOption('select[name="courseId"]', { index: 1 });
      await page.selectOption('select[name="offeringId"]', { index: 1 });
      await page.click('button:has-text("Calculate Attainment")');

      // Wait for results
      await page.waitForSelector('[data-testid="attainment-results"]', { timeout: 10000 });

      // Should show attainment levels (High/Medium/Low)
      const attainmentLevels = page.locator('[data-testid="attainment-level"]');
      await expect(attainmentLevels.first()).toBeVisible();
      
      // Should have color coding
      const hasColorClass = await attainmentLevels.first().evaluate(el => {
        return el.classList.contains('high') || 
               el.classList.contains('medium') || 
               el.classList.contains('low');
      });
      expect(hasColorClass).toBeTruthy();
    });

    test('should show attainment breakdown by assessment', async ({ page }) => {
      await page.goto('/attainment/clo');
      await page.selectOption('select[name="courseId"]', { index: 1 });
      await page.selectOption('select[name="offeringId"]', { index: 1 });
      await page.click('button:has-text("Calculate Attainment")');

      await page.waitForSelector('[data-testid="attainment-results"]');

      // Click view details on a CLO
      await page.locator('[data-testid="clo-item"]').first()
        .locator('button:has-text("Details")').click();

      // Should show assessment breakdown
      await expect(page.locator('text=Assessment Breakdown')).toBeVisible();
      await expect(page.locator('[data-testid="assessment-contribution"]')).toBeVisible();
    });

    test('should visualize CLO attainment with charts', async ({ page }) => {
      await page.goto('/attainment/clo');
      await page.selectOption('select[name="courseId"]', { index: 1 });
      await page.selectOption('select[name="offeringId"]', { index: 1 });
      await page.click('button:has-text("Calculate Attainment")');

      await page.waitForSelector('[data-testid="attainment-results"]');

      // Click view charts
      await page.click('button:has-text("View Charts")');

      // Should display charts
      await expect(page.locator('canvas')).toBeVisible();
      
      // Should have multiple chart types
      const charts = await page.locator('canvas').count();
      expect(charts).toBeGreaterThan(0);
    });

    test('should compare CLO attainment across sections', async ({ page }) => {
      await page.goto('/attainment/clo');
      await page.selectOption('select[name="courseId"]', { index: 1 });

      // Select multiple sections
      await page.check('input[name="compareSection"]');
      await page.selectOption('select[name="sections"]', { label: 'All Sections' });

      await page.click('button:has-text("Calculate Attainment")');

      await page.waitForSelector('[data-testid="comparison-results"]');

      // Should show comparison table
      await expect(page.locator('[data-testid="section-comparison"]')).toBeVisible();
      
      // Should highlight best and worst performing sections
      await expect(page.locator('[data-testid="best-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="needs-improvement"]')).toBeVisible();
    });
  });

  test.describe('PLO Attainment', () => {
    test('should calculate PLO attainment', async ({ page }) => {
      await page.goto('/attainment/plo');

      // Select degree program
      await page.selectOption('select[name="degreeId"]', { index: 1 });

      // Select academic session
      await page.selectOption('select[name="sessionId"]', { index: 1 });

      // Calculate
      await page.click('button:has-text("Calculate PLO Attainment")');

      // Should show loading
      await expect(page.locator('text=/calculating|processing/i')).toBeVisible();

      // Should display results
      await expect(page.locator('[data-testid="plo-attainment-results"]')).toBeVisible({ timeout: 10000 });
    });

    test('should show PLO-CLO mapping impact', async ({ page }) => {
      await page.goto('/attainment/plo');
      await page.selectOption('select[name="degreeId"]', { index: 1 });
      await page.selectOption('select[name="sessionId"]', { index: 1 });
      await page.click('button:has-text("Calculate PLO Attainment")');

      await page.waitForSelector('[data-testid="plo-attainment-results"]');

      // Click on a PLO to see details
      await page.locator('[data-testid="plo-item"]').first().click();

      // Should show contributing CLOs
      await expect(page.locator('text=Contributing CLOs')).toBeVisible();
      await expect(page.locator('[data-testid="clo-contribution"]')).toBeVisible();
    });

    test('should display PLO attainment trends', async ({ page }) => {
      await page.goto('/attainment/plo');
      await page.selectOption('select[name="degreeId"]', { index: 1 });

      // Select multiple sessions for trend
      await page.check('input[name="showTrend"]');
      await page.selectOption('select[name="sessions"]', { label: 'Last 3 Years' });

      await page.click('button:has-text("Calculate PLO Attainment")');

      await page.waitForSelector('[data-testid="trend-chart"]');

      // Should show trend chart
      await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
      
      // Should show improvement/decline indicators
      await expect(page.locator('[data-testid="trend-indicator"]')).toBeVisible();
    });

    test('should generate PLO attainment report', async ({ page }) => {
      await page.goto('/attainment/plo');
      await page.selectOption('select[name="degreeId"]', { index: 1 });
      await page.selectOption('select[name="sessionId"]', { index: 1 });
      await page.click('button:has-text("Calculate PLO Attainment")');

      await page.waitForSelector('[data-testid="plo-attainment-results"]');

      // Generate report
      await page.click('button:has-text("Generate Report")');

      // Should show report preview
      await expect(page.locator('[data-testid="report-preview"]')).toBeVisible();

      // Should have download option
      await expect(page.locator('button:has-text("Download")')).toBeVisible();
    });
  });

  test.describe('Attainment Thresholds', () => {
    test('should configure attainment thresholds', async ({ page }) => {
      await page.goto('/attainment/thresholds');

      // Edit high threshold
      await page.locator('[data-testid="threshold-high"]')
        .locator('input[name="minPercentage"]').fill('80');
      
      await page.locator('[data-testid="threshold-medium"]')
        .locator('input[name="minPercentage"]').fill('60');
      
      await page.locator('[data-testid="threshold-low"]')
        .locator('input[name="minPercentage"]').fill('40');

      // Save thresholds
      await page.click('button:has-text("Save Thresholds")');

      // Should show success message
      await expect(page.locator('text=/saved|updated|success/i')).toBeVisible();
    });

    test('should validate threshold ranges', async ({ page }) => {
      await page.goto('/attainment/thresholds');

      // Try to set invalid ranges (overlapping)
      await page.locator('[data-testid="threshold-high"]')
        .locator('input[name="minPercentage"]').fill('50');
      
      await page.locator('[data-testid="threshold-medium"]')
        .locator('input[name="minPercentage"]').fill('60');

      await page.click('button:has-text("Save Thresholds")');

      // Should show validation error
      await expect(page.locator('text=/invalid|overlap/i')).toBeVisible();
    });

    test('should apply thresholds to attainment calculation', async ({ page }) => {
      await page.goto('/attainment/clo');
      await page.selectOption('select[name="courseId"]', { index: 1 });
      await page.selectOption('select[name="offeringId"]', { index: 1 });
      await page.click('button:has-text("Calculate Attainment")');

      await page.waitForSelector('[data-testid="attainment-results"]');

      // Attainment levels should reflect configured thresholds
      const attainmentLevel = await page.locator('[data-testid="attainment-level"]').first().textContent();
      expect(['High', 'Medium', 'Low']).toContain(attainmentLevel.trim());
    });
  });

  test.describe('Indirect Attainment', () => {
    test('should calculate indirect attainment from surveys', async ({ page }) => {
      await page.goto('/attainment/indirect');

      // Select survey
      await page.selectOption('select[name="surveyId"]', { index: 1 });

      // Select course
      await page.selectOption('select[name="courseId"]', { index: 1 });

      // Calculate
      await page.click('button:has-text("Calculate")');

      // Should show results
      await expect(page.locator('[data-testid="indirect-attainment-results"]')).toBeVisible();

      // Should show survey response statistics
      await expect(page.locator('text=/response rate|responses/i')).toBeVisible();
    });

    test('should combine direct and indirect attainment', async ({ page }) => {
      await page.goto('/attainment/combined');

      await page.selectOption('select[name="courseId"]', { index: 1 });
      await page.selectOption('select[name="offeringId"]', { index: 1 });

      // Set weights
      await page.fill('input[name="directWeight"]', '70');
      await page.fill('input[name="indirectWeight"]', '30');

      await page.click('button:has-text("Calculate Combined Attainment")');

      await page.waitForSelector('[data-testid="combined-results"]');

      // Should show combined attainment
      await expect(page.locator('[data-testid="combined-percentage"]')).toBeVisible();
      
      // Should show breakdown
      await expect(page.locator('text=Direct Attainment:')).toBeVisible();
      await expect(page.locator('text=Indirect Attainment:')).toBeVisible();
    });
  });

  test.describe('Attainment Action Plans', () => {
    test('should create action plan for low attainment', async ({ page }) => {
      await page.goto('/attainment/clo');
      await page.selectOption('select[name="courseId"]', { index: 1 });
      await page.selectOption('select[name="offeringId"]', { index: 1 });
      await page.click('button:has-text("Calculate Attainment")');

      await page.waitForSelector('[data-testid="attainment-results"]');

      // Find CLO with low attainment and create action plan
      const lowCLO = page.locator('[data-testid="attainment-level"]:has-text("Low")').first();
      
      if (await lowCLO.isVisible()) {
        const cloRow = lowCLO.locator('xpath=ancestor::tr | ancestor::div[@data-testid="clo-item"]').first();
        await cloRow.locator('button:has-text("Action Plan")').click();

        // Fill action plan
        await page.fill('textarea[name="issues"]', 'Students struggling with complex concepts');
        await page.fill('textarea[name="actions"]', 'Provide additional tutorials and practice problems');
        await page.fill('input[name="targetDate"]', '2026-06-30');

        await page.click('button[type="submit"]');

        // Should show success message
        await expect(page.locator('text=/created|success/i')).toBeVisible();
      }
    });

    test('should view and track action plans', async ({ page }) => {
      await page.goto('/attainment/action-plans');

      // Should see list of action plans
      await expect(page.locator('[data-testid="action-plan-list"]')).toBeVisible();

      // Click on action plan to view details
      await page.locator('[data-testid="action-plan-item"]').first().click();

      // Should show action plan details
      await expect(page.locator('text=Issues Identified')).toBeVisible();
      await expect(page.locator('text=Planned Actions')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
    });

    test('should update action plan status', async ({ page }) => {
      await page.goto('/attainment/action-plans');
      await page.locator('[data-testid="action-plan-item"]').first().click();

      // Update status
      await page.selectOption('select[name="status"]', 'in-progress');
      
      // Add progress note
      await page.fill('textarea[name="progressNote"]', 'Conducted first tutorial session');
      
      await page.click('button:has-text("Update")');

      // Should show success message
      await expect(page.locator('text=/updated|success/i')).toBeVisible();
    });
  });

  test.describe('Attainment Reports', () => {
    test('should generate comprehensive attainment report', async ({ page }) => {
      await page.goto('/attainment/reports');

      // Select report type
      await page.selectOption('select[name="reportType"]', 'comprehensive');

      // Select course
      await page.selectOption('select[name="courseId"]', { index: 1 });

      // Generate report
      await page.click('button:has-text("Generate Report")');

      // Should show loading
      await expect(page.locator('text=/generating/i')).toBeVisible();

      // Should display report
      await expect(page.locator('[data-testid="report-content"]')).toBeVisible({ timeout: 15000 });

      // Report should contain key sections
      await expect(page.locator('text=CLO Attainment Summary')).toBeVisible();
      await expect(page.locator('text=PLO Attainment Summary')).toBeVisible();
      await expect(page.locator('text=Analysis')).toBeVisible();
    });

    test('should export attainment report', async ({ page }) => {
      await page.goto('/attainment/reports');
      await page.selectOption('select[name="reportType"]', 'comprehensive');
      await page.selectOption('select[name="courseId"]', { index: 1 });
      await page.click('button:has-text("Generate Report")');

      await page.waitForSelector('[data-testid="report-content"]');

      // Export as PDF
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export")');
      await page.click('text=PDF');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/attainment.*\.pdf$/i);
    });

    test('should schedule automated report generation', async ({ page }) => {
      await page.goto('/attainment/reports');

      // Click schedule report
      await page.click('button:has-text("Schedule Report")');

      // Configure schedule
      await page.selectOption('select[name="frequency"]', 'monthly');
      await page.selectOption('select[name="reportType"]', 'comprehensive');
      await page.fill('input[name="recipients"]', 'admin@example.com, hod@example.com');

      // Save schedule
      await page.click('button:has-text("Save Schedule")');

      // Should show success message
      await expect(page.locator('text=/scheduled|success/i')).toBeVisible();
    });
  });

  test.describe('Attainment Dashboard', () => {
    test('should display attainment overview on dashboard', async ({ page }) => {
      await page.goto('/attainment/dashboard');

      // Should show key metrics
      await expect(page.locator('[data-testid="overall-attainment"]')).toBeVisible();
      await expect(page.locator('[data-testid="courses-analyzed"]')).toBeVisible();
      await expect(page.locator('[data-testid="low-attainment-clos"]')).toBeVisible();

      // Should show recent calculations
      await expect(page.locator('[data-testid="recent-calculations"]')).toBeVisible();
    });

    test('should filter dashboard by program', async ({ page }) => {
      await page.goto('/attainment/dashboard');

      // Apply program filter
      await page.selectOption('select[name="degreeFilter"]', { index: 1 });

      // Dashboard should update
      await expect(page.locator('[data-testid="overall-attainment"]')).toBeVisible();
      
      // Data should be filtered
      const programName = await page.locator('select[name="degreeFilter"] option:checked').textContent();
      await expect(page.locator(`text=${programName}`)).toBeVisible();
    });

    test('should show attainment trends on dashboard', async ({ page }) => {
      await page.goto('/attainment/dashboard');

      // Should display trend charts
      await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();

      // Should show comparison with previous period
      await expect(page.locator('text=/compared to|vs previous/i')).toBeVisible();
    });
  });
});
