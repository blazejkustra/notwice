---
kind: forbid
pattern: '\bscreen\.debug\('
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
Remove screen.debug() from tests.

## Bad
~~~~
screen.debug()
~~~~

## Good
~~~~
expect(screen.getByRole("heading")).toBeVisible()
~~~~
