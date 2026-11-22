---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]colors[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on colors; reach for picocolors.

## Bad
~~~~
import colors from 'colors'
~~~~

## Good
~~~~
import pc from 'picocolors'
~~~~
