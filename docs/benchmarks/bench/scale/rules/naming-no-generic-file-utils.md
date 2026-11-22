---
kind: forbid
pattern: 'from\s+[''"][./]+(?:utils|helpers|misc|common)[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Do not import from catch-all utils or helpers modules; import the specific module.

## Bad
~~~~
import { format } from '../utils'
~~~~

## Good
~~~~
import { formatPrice } from '../price/format'
~~~~
