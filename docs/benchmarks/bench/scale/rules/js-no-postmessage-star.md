---
kind: forbid
pattern: '\.postMessage\([^)]*,\s*[''"]\*[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Always pass an explicit target origin to postMessage.

## Bad
~~~~
parent.postMessage(data, "*")
~~~~

## Good
~~~~
parent.postMessage(data, "https://app.example.com")
~~~~
