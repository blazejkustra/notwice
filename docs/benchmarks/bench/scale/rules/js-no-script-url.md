---
kind: forbid
pattern: '[''"]javascript:'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No javascript: URLs; attach an event handler.

## Bad
~~~~
link.href = "javascript:void(0)"
~~~~

## Good
~~~~
link.addEventListener("click", onClick)
~~~~
