---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]enzyme(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on enzyme; reach for @testing-library/react.

## Bad
~~~~
import enzyme from 'enzyme'
~~~~

## Good
~~~~
import { render } from '@testing-library/react'
~~~~
