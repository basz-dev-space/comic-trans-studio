import { test, expect } from '@playwright/test';

test.describe('DataGrid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/chapter/test-chapter-id');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    await page.click('button:has-text("DataGrid")');
  });

  test('should display all text boxes in table', async ({ page }) => {
    await page.click('button:has-text("Add Text")');
    await page.click('button:has-text("Add Text")');

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(2);
  });

  test('should edit text in grid', async ({ page }) => {
    await page.click('button:has-text("Add Text")');

    const inputs = page.locator('tbody input[type="text"]');
    // Use nth(0) since only one text box was added (index 0, not 1)
    await inputs.nth(0).fill('Grid edited');
    await inputs.nth(0).blur();

    await expect(page.locator('text=Grid edited')).toBeVisible();
  });

  test('should filter rows', async ({ page }) => {
    await page.click('button:has-text("Add Text")');

    const searchInput = page.locator('input[placeholder="Search..."]');
    await searchInput.fill('Hello');

    await expect(page.locator('text=Double-click to edit')).toBeVisible();
  });

  test('should select and delete rows', async ({ page }) => {
    await page.click('button:has-text("Add Text")');

    const checkbox = page.locator('tbody input[type="checkbox"]');
    await checkbox.nth(0).check();

    const deleteButton = page.locator('button:has-text("Delete")');
    await deleteButton.click();

    await expect(page.locator('text=Double-click to edit')).not.toBeVisible();
  });
});
