---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]event-stream(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace event-stream with node:stream.

## Bad
~~~~
import eventStream from 'event-stream'
~~~~

## Good
~~~~
import { pipeline } from 'node:stream/promises'
~~~~
