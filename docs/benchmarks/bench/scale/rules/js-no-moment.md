---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]moment(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on moment; reach for date-fns or Temporal.

## Bad
~~~~
import moment from 'moment'
~~~~

## Good
~~~~
import { format } from 'date-fns'
~~~~
