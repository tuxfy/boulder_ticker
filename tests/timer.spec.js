const { test, expect } = require('@playwright/test');

test.describe('Timer', () => {
  test.beforeEach(async ({ page }) => {
    // Fake-Clock installieren, bevor die Seite lädt — so lassen sich die
    // Phasenwechsel ohne echtes Warten durchspielen.
    await page.clock.install();
    await page.goto('/#/timer');
    await expect(page.locator('#screen-timer')).toBeVisible();
  });

  test('zeigt die Konfiguration und ändert einen Parameter', async ({ page }) => {
    await expect(page.locator('#timer-config')).toBeVisible();
    await expect(page.locator('#timer-display')).toBeHidden();

    const workRow = page.locator('.timer-param').filter({ has: page.locator('#val-work') });
    await workRow.getByRole('button', { name: '+' }).click();

    await expect(page.locator('#val-work')).toHaveValue('46');

    // Änderung wird im localStorage gespeichert
    const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('timer_cfg')));
    expect(cfg.work).toBe(46);
  });

  test('startet und läuft durch die Phasen (Vorbereitung → Work → Rest)', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();

    await expect(page.locator('#timer-display')).toBeVisible();
    await expect(page.locator('#timer-config')).toBeHidden();
    await expect(page.locator('#timer-phase')).toHaveText('Vorbereitung');
    await expect(page.locator('#timer-time')).toHaveText('0:10');

    // 10 s Vorbereitung → Work (Standard: 45 s)
    await page.clock.runFor(10_000);
    await expect(page.locator('#timer-phase')).toHaveText('Work');
    await expect(page.locator('#timer-time')).toHaveText('0:45');

    // 45 s Work → Rest (Standard: 90 s)
    await page.clock.runFor(45_000);
    await expect(page.locator('#timer-phase')).toHaveText('Rest');
    await expect(page.locator('#timer-time')).toHaveText('1:30');
  });

  test('pausiert den Lauf', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await page.clock.runFor(10_000); // in die Work-Phase
    await expect(page.locator('#timer-phase')).toHaveText('Work');
    await expect(page.locator('#timer-time')).toHaveText('0:45');

    await page.locator('#btn-pause').click();
    await expect(page.locator('#btn-pause')).toHaveText('Weiter');

    // Während der Pause läuft die Zeit nicht weiter
    await page.clock.runFor(5_000);
    await expect(page.locator('#timer-time')).toHaveText('0:45');
  });
});
