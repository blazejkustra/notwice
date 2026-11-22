---
kind: forbid
pattern: '^\s*debugger\s*;?\s*$'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Remove debugger statements before committing.

## Bad
~~~~
  debugger
~~~~

## Good
~~~~
  // inspect state in the debugger UI instead
~~~~
