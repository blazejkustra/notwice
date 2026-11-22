---
kind: forbid
pattern: '\bpage\.pause\(\)'
targets: [files]
paths: ['e2e/**/*.{js,ts}', 'cypress/**/*.{js,ts}', '*.cy.{js,ts}', '*.e2e.{js,ts}']
severity: block
from: benchmark distractor (testing)
---
Remove page.pause() before committing.

## Bad
~~~~
await page.pause()
~~~~

## Good
~~~~
await expect(page).toHaveURL("/done")
~~~~
