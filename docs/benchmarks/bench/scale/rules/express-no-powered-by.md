---
kind: forbid
pattern: 'app\.enable\(\s*[''"]x-powered-by[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
Keep the x-powered-by header disabled.

## Bad
~~~~
app.enable("x-powered-by")
~~~~

## Good
~~~~
app.disable("x-powered-by")
~~~~
