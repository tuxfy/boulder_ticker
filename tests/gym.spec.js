const { test, expect } = require('@playwright/test');

// Deterministische Hallenliste: Cache im localStorage vorab befüllen, damit
// onGymScreenOpen() keinen echten Firestore-Request braucht.
const GYMS = [
  { locationId: 'g1', label: 'Berta Block', city: 'Berlin', normKey: 'berta block berlin' },
  { locationId: 'g2', label: 'Boulderklub', city: 'Berlin', normKey: 'boulderklub berlin' },
  { locationId: 'g3', label: 'Ostbloc', city: 'Berlin', normKey: 'ostbloc berlin' },
];

test.describe('Gym-Auswahl', () => {
  test.beforeEach(async ({ page }) => {
    // Firestore-Requests zur Sicherheit blocken (Cache soll genutzt werden)
    await page.route('**firestore.googleapis.com/**', (route) => route.abort());
    await page.addInitScript((gyms) => {
      localStorage.setItem('beta7_gyms', JSON.stringify({ ts: Date.now(), data: gyms }));
    }, GYMS);
  });

  test('zeigt die (gecachte) Hallenliste', async ({ page }) => {
    await page.goto('/#/gym');
    await expect(page.locator('#screen-gym')).toBeVisible();
    await expect(page.locator('#gym-list .gym-item')).toHaveCount(3);
    await expect(page.locator('#gym-list')).toContainText('Berta Block');
  });

  test('filtert die Liste über die Suche', async ({ page }) => {
    await page.goto('/#/gym');
    await page.locator('#gym-search').fill('boulder');
    await expect(page.locator('#gym-list .gym-item')).toHaveCount(1);
    await expect(page.locator('#gym-list')).toContainText('Boulderklub');
  });

  test('wählt eine Halle und zeigt sie im Boulder-Log', async ({ page }) => {
    await page.goto('/#/gym');
    await page.locator('#gym-list .gym-item', { hasText: 'Berta Block' }).click();

    // Auswahl führt zurück ins Boulder-Log und zeigt die Halle in der Leiste
    await expect(page).toHaveURL(/#\/boulderlog$/);
    await expect(page.locator('#gym-bar-text')).toContainText('Berta Block');

    const sel = await page.evaluate(() => JSON.parse(localStorage.getItem('beta7_gym_sel')));
    expect(sel.label).toBe('Berta Block');
  });
});
