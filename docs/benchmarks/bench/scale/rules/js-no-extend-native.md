---
kind: forbid
pattern: '\b(?:Array|Object|String|Number|Function|Promise)\.prototype\.\w+\s*='
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Never extend built-in prototypes.

## Bad
~~~~
Array.prototype.last = function () {}
~~~~

## Good
~~~~
const last = (list) => list.at(-1)
~~~~
