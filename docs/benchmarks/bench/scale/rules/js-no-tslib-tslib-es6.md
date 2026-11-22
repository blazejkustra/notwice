---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]tslib\/tslib\.es6(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on tslib/tslib.es6; reach for importHelpers with the tslib package root.

## Bad
~~~~
import tslibTslibEs6 from 'tslib/tslib.es6'
~~~~

## Good
~~~~
import { __awaiter } from 'tslib'
~~~~
