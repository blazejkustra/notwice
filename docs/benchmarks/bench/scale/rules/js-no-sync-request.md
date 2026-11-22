---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]sync-request(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import sync-request; use async fetch.

## Bad
~~~~
import syncRequest from 'sync-request'
~~~~

## Good
~~~~
const res = await fetch(url)
~~~~
