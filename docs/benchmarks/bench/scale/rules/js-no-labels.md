---
kind: forbid
pattern: '^\s*[A-Za-z_]\w*:\s*(?:for|while|do)\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No labelled loops; extract a function and return.

## Bad
~~~~
outer: for (const row of rows) {
~~~~

## Good
~~~~
for (const row of rows) {
~~~~
