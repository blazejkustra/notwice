---
kind: forbid
pattern: '\.indexOf\([^)]*\)\s*(?:!==?|>=?|===?|<)\s*-1'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use includes() instead of comparing indexOf with -1.

## Bad
~~~~
if (tags.indexOf("new") !== -1) show()
~~~~

## Good
~~~~
if (tags.includes("new")) show()
~~~~
