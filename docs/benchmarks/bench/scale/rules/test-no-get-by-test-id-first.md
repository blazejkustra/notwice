---
kind: forbid
pattern: 'getByTestId\('
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: warn
from: benchmark distractor (testing)
---
Query by role or label before falling back to test ids.

## Bad
~~~~
screen.getByTestId("submit")
~~~~

## Good
~~~~
screen.getByRole("button", { name: "Submit" })
~~~~
