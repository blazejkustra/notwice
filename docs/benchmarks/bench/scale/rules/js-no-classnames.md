---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]classnames(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on classnames; reach for clsx.

## Bad
~~~~
import classnames from 'classnames'
~~~~

## Good
~~~~
import clsx from 'clsx'
~~~~
