const { test, expect } = require('@playwright/test');

test.describe('Boulder-Log', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/boulderlog');
    await expect(page.locator('#screen-boulderlog')).toBeVisible();
  });

  test('legt einen Eintrag an', async ({ page }) => {
    await page.locator('#grade').fill('6a');
    await page.locator('#style').fill('crimp');
    await page.locator('.btn-add').click();

    await expect(page.locator('#log')).toHaveValue('- 6a: 1 try - crimp');

    // Nach dem Anlegen sind die Eingaben zurückgesetzt
    await expect(page.locator('#tries-val')).toHaveText('1');
    await expect(page.locator('#style')).toHaveValue('');
  });

  test('erhöht und verringert die Versuche (min. 1)', async ({ page }) => {
    const stepper = page.locator('.input-grid .stepper');
    const minus = stepper.locator('button').first();
    const plus = stepper.locator('button').last();

    await plus.click();
    await plus.click();
    await expect(page.locator('#tries-val')).toHaveText('3');

    await minus.click();
    await expect(page.locator('#tries-val')).toHaveText('2');

    // Untergrenze 1 wird nicht unterschritten
    await minus.click();
    await minus.click();
    await expect(page.locator('#tries-val')).toHaveText('1');

    await page.locator('#grade').fill('7a');
    await page.locator('.btn-add').click();
    await expect(page.locator('#log')).toHaveValue('- 7a: 1 try');
  });

  test('markiert einen Eintrag als send', async ({ page }) => {
    await page.locator('#grade').fill('6b');
    await page.locator('#send-btn').click();
    await page.locator('.btn-add').click();

    await expect(page.locator('#log')).toHaveValue('- 6b: 1 try (send)');
    // Send-Zustand wird nach dem Anlegen zurückgesetzt
    await expect(page.locator('#send-btn')).not.toHaveClass(/active/);
  });

  test('kopiert den Log in die Zwischenablage', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.locator('#grade').fill('6a');
    await page.locator('.btn-add').click();

    await page.locator('#copyBtn').click();
    await expect(page.locator('#copyBtn')).toHaveText('Kopiert ✓');

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe('- 6a: 1 try');
  });

  test('setzt den Log nach Bestätigung zurück', async ({ page }) => {
    await page.locator('#grade').fill('6a');
    await page.locator('.btn-add').click();
    await expect(page.locator('#log')).not.toHaveValue('');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Reset' }).click();

    await expect(page.locator('#log')).toHaveValue('');
    const stored = await page.evaluate(() => localStorage.getItem('boulder_log'));
    expect(stored).toBeNull();
  });

  test('persistiert den Log im localStorage über einen Reload', async ({ page }) => {
    await page.locator('#grade').fill('6a');
    await page.locator('.btn-add').click();
    await page.locator('#grade').fill('7a');
    await page.locator('.btn-add').click();

    const expected = '- 6a: 1 try\n- 7a: 1 try';
    await expect(page.locator('#log')).toHaveValue(expected);

    const stored = await page.evaluate(() => localStorage.getItem('boulder_log'));
    expect(stored).toBe(expected);

    // Nach dem Reload ist der Log weiterhin vorhanden
    await page.reload();
    await page.goto('/#/boulderlog');
    await expect(page.locator('#log')).toHaveValue(expected);
  });
});
