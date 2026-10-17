const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test('startet auf dem Home-Screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#screen-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bouldering Berlin' })).toBeVisible();
  });

  test('wechselt zwischen Home, Boulder-Log und Timer', async ({ page }) => {
    await page.goto('/');

    // Home → Boulder Log
    await page.getByRole('button', { name: 'Boulder Log' }).click();
    await expect(page).toHaveURL(/#\/boulderlog$/);
    await expect(page.locator('#screen-boulderlog')).toBeVisible();
    await expect(page.locator('#screen-home')).toBeHidden();

    // Boulder Log → Home
    await page.locator('#screen-boulderlog').getByRole('button', { name: /Tools/ }).click();
    await expect(page.locator('#screen-home')).toBeVisible();

    // Home → Timer
    await page.getByRole('button', { name: 'Timer' }).click();
    await expect(page).toHaveURL(/#\/timer$/);
    await expect(page.locator('#screen-timer')).toBeVisible();

    // Timer → Home
    await page.locator('#screen-timer').getByRole('button', { name: /Tools/ }).click();
    await expect(page.locator('#screen-home')).toBeVisible();
  });

  test('zeigt die passende View beim Direktaufruf per Hash', async ({ page }) => {
    await page.goto('/#/timer');
    await expect(page.locator('#screen-timer')).toBeVisible();
    await expect(page.locator('#screen-home')).toBeHidden();
  });
});
