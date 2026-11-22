---
kind: forbid
pattern: 'jest\.setTimeout\(\s*\d{5,}'
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
Do not raise the Jest timeout to hide slow tests.

## Bad
~~~~
jest.setTimeout(60000)
~~~~

## Good
~~~~
jest.useFakeTimers()
~~~~
