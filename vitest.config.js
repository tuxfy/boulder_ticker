const { defineConfig, configDefaults } = require('vitest/config');

// Unit-Tests der Logik-Module, co-lokalisiert als src/**/*.test.js.
// E2E (Playwright) lebt in tests/ und wird hier bewusst NICHT erfasst
// (include eingegrenzt), damit kein Runner die Dateien des anderen aufsammelt.
// Default-Umgebung: node. Module mit Browser-APIs setzen pro Datei oben
// "// @vitest-environment jsdom" (store.js, router.js).
module.exports = defineConfig({
  test: {
    include: ['src/**/*.test.js'],
    exclude: [...configDefaults.exclude, 'tests/**'],
    environment: 'node',
  },
});
