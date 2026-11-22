---
kind: forbid
pattern: '\bconsole\.log\('
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
No console.log in tests.

## Bad
~~~~
console.log(result)
~~~~

## Good
~~~~
expect(result).toEqual(expected)
~~~~
