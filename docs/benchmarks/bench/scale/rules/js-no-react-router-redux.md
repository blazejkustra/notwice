---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]react-router-redux(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
react-router-redux is banned in this codebase. Use React Router hooks instead.

## Bad
~~~~
import reactRouterRedux from 'react-router-redux'
~~~~

## Good
~~~~
import { useNavigate } from 'react-router'
~~~~
