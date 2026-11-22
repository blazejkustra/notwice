---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]react-helmet[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace react-helmet with React 19 document metadata or react-helmet-async.

## Bad
~~~~
import reactHelmet from 'react-helmet'
~~~~

## Good
~~~~
import { Helmet } from 'react-helmet-async'
~~~~
