---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]lodash[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import lodash; use per-method imports from lodash-es or native code.

## Bad
~~~~
import lodash from 'lodash'
~~~~

## Good
~~~~
import debounce from 'lodash-es/debounce'
~~~~
