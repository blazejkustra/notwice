---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]supertest-as-promised(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
supertest-as-promised is banned in this codebase. Use supertest instead.

## Bad
~~~~
import supertestAsPromised from 'supertest-as-promised'
~~~~

## Good
~~~~
import request from 'supertest'
~~~~
