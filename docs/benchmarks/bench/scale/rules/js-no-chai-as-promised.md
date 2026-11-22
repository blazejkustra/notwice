---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]chai-as-promised(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on chai-as-promised; reach for native rejects assertions.

## Bad
~~~~
import chaiAsPromised from 'chai-as-promised'
~~~~

## Good
~~~~
await assert.rejects(load())
~~~~
