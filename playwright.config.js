const { defineConfig, devices } = require('@playwright/test');

/**
 * E2E-Konfiguration für die statische PWA.
 * Playwright startet den lokalen Static-Server (`scripts/serve.js`, abhängigkeitsfrei) selbst und testet gegen http://localhost:3000.
 * Der Service Worker wird blockiert, damit kein gecachter Stand die Tests verfälscht.
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    serviceWorkers: 'block',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // WebKit = Safari-Engine, relevant wegen des iOS-Fokus der App.
    // Nicht im Standard-Lauf; gezielt per `npm run test:webkit`.
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'node scripts/serve.js',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
