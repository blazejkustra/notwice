---
kind: forbid
pattern: '\b(?:it|test|describe|context)\.only\(|\bf(?:it|describe)\('
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
Never commit .only or fit/fdescribe in tests.

## Bad
~~~~
it.only("renders", () => {
~~~~

## Good
~~~~
it("renders", () => {
~~~~
