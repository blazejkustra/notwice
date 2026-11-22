---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]shortid(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import shortid; use nanoid.

## Bad
~~~~
import shortid from 'shortid'
~~~~

## Good
~~~~
import { nanoid } from 'nanoid'
~~~~
