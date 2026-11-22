---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]react-query[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on react-query; reach for @tanstack/react-query.

## Bad
~~~~
import reactQuery from 'react-query'
~~~~

## Good
~~~~
import { useQuery } from '@tanstack/react-query'
~~~~
