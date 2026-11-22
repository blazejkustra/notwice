---
kind: forbid
pattern: 'expect\(\s*true\s*\)\.toBe\(\s*true\s*\)|assert\.ok\(\s*true\s*\)'
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
No placeholder assertions like expect(true).toBe(true).

## Bad
~~~~
expect(true).toBe(true)
~~~~

## Good
~~~~
expect(total).toBe(42)
~~~~
