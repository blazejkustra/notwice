---
kind: forbid
pattern: '\bx(?:it|describe|test)\('
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
Do not leave xit or xdescribe in tests.

## Bad
~~~~
xit("handles errors", () => {
~~~~

## Good
~~~~
it("handles errors", () => {
~~~~
