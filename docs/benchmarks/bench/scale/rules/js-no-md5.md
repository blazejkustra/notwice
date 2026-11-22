---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]md5[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on md5; reach for node:crypto.

## Bad
~~~~
import md5 from 'md5'
~~~~

## Good
~~~~
import { createHash } from 'node:crypto'
~~~~
