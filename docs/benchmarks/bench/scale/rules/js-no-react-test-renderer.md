---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]react-test-renderer(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
react-test-renderer is banned in this codebase. Use @testing-library/react instead.

## Bad
~~~~
import reactTestRenderer from 'react-test-renderer'
~~~~

## Good
~~~~
import { render } from '@testing-library/react'
~~~~
