---
kind: forbid
pattern: '\bset(?:Timeout|Interval)\(\s*[''"\x60]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Pass a function to setTimeout and setInterval, never a string.

## Bad
~~~~
setTimeout("refresh()", 1000)
~~~~

## Good
~~~~
setTimeout(refresh, 1000)
~~~~
