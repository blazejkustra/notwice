---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]redux-thunk(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace redux-thunk with RTK Query or createAsyncThunk from @reduxjs/toolkit.

## Bad
~~~~
import reduxThunk from 'redux-thunk'
~~~~

## Good
~~~~
import { createAsyncThunk } from '@reduxjs/toolkit'
~~~~
