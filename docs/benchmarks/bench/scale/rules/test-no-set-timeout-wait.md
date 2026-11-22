---
kind: forbid
pattern: 'await\s+new\s+Promise\(\s*\(?\s*r(?:esolve)?\s*\)?\s*=>\s*setTimeout\('
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
No sleeps in tests; use fake timers or wait for a condition.

## Bad
~~~~
await new Promise((r) => setTimeout(r, 500))
~~~~

## Good
~~~~
await vi.advanceTimersByTimeAsync(500)
~~~~
