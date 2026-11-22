---
kind: forbid
pattern: '\burl\.parse\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use the WHATWG URL class instead of url.parse.

## Bad
~~~~
const parts = url.parse(href)
~~~~

## Good
~~~~
const parts = new URL(href)
~~~~
