---
kind: forbid
pattern: '(?<![\w.])(?:alert|confirm|prompt)\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No alert, confirm or prompt in app code; use the dialog component.

## Bad
~~~~
alert("Saved")
~~~~

## Good
~~~~
toast.show("Saved")
~~~~
