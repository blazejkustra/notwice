---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]node-sass(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace node-sass with the sass package.

## Bad
~~~~
import nodeSass from 'node-sass'
~~~~

## Good
~~~~
import * as sass from 'sass'
~~~~
