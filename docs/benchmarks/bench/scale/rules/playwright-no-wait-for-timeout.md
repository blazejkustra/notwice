---
kind: forbid
pattern: '\.waitForTimeout\('
targets: [files]
paths: ['e2e/**/*.{js,ts}', 'cypress/**/*.{js,ts}', '*.cy.{js,ts}', '*.e2e.{js,ts}']
severity: block
from: benchmark distractor (testing)
---
No waitForTimeout in Playwright; use auto-waiting assertions.

## Bad
~~~~
await page.waitForTimeout(1000)
~~~~

## Good
~~~~
await expect(page.getByText("Saved")).toBeVisible()
~~~~
