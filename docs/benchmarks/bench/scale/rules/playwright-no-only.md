---
kind: forbid
pattern: '\btest\.(?:describe\.)?only\('
targets: [files]
paths: ['e2e/**/*.{js,ts}', 'cypress/**/*.{js,ts}', '*.cy.{js,ts}', '*.e2e.{js,ts}']
severity: block
from: benchmark distractor (testing)
---
Never commit test.only in Playwright specs.

## Bad
~~~~
test.only("checkout", async ({ page }) => {
~~~~

## Good
~~~~
test("checkout", async ({ page }) => {
~~~~
