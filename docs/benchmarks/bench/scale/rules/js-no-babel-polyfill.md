---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]babel-polyfill(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
babel-polyfill is banned in this codebase. Use core-js with useBuiltIns instead.

## Bad
~~~~
import babelPolyfill from 'babel-polyfill'
~~~~

## Good
~~~~
import 'core-js/stable'
~~~~
