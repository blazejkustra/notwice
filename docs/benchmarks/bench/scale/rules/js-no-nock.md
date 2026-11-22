---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]nock(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import nock; use msw.

## Bad
~~~~
import nock from 'nock'
~~~~

## Good
~~~~
import { http, HttpResponse } from 'msw'
~~~~
