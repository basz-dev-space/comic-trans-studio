import { test, expect } from '@playwright/test';

test.describe('Canvas Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/chapter/test-chapter-id');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
  });

  test('should add text layer', async ({ page }) => {
    await page.click('button:has-text("Add Text")');
    await expect(page.locator('text=Double-click to edit')).toBeVisible();
  });

  test('should select and edit text box', async ({ page }) => {
    await page.click('button:has-text("Add Text")');
    await page.click('text=Double-click to edit');
    await expect(page.locator('text=Font')).toBeVisible();
  });

  test('should use keyboard shortcuts', async ({ page }) => {
    await page.keyboard.press('t');
    await expect(page.locator('text=Double-click to edit')).toBeVisible();

    await page.keyboard.press('Delete');
    await expect(page.locator('text=Double-click to edit')).not.toBeVisible();
  });

  test('should undo and redo', async ({ page }) => {
    await page.click('button:has-text("Add Text")');
    await expect(page.locator('text=Double-click to edit')).toBeVisible();

    await page.click('button[aria-label="Undo"]');
    await expect(page.locator('text=Double-click to edit')).not.toBeVisible();

    await page.click('button[aria-label="Redo"]');
    await expect(page.locator('text=Double-click to edit')).toBeVisible();
  });
});
