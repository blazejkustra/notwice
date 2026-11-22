---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]body-parser(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on body-parser; reach for express.json().

## Bad
~~~~
import bodyParser from 'body-parser'
~~~~

## Good
~~~~
app.use(express.json())
~~~~
