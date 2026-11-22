---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]faker[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace faker with @faker-js/faker.

## Bad
~~~~
import faker from 'faker'
~~~~

## Good
~~~~
import { faker } from '@faker-js/faker'
~~~~
