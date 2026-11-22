---
kind: forbid
pattern: '\b(?:const|let)\s+(?:data2|temp2|foo|bar|baz|stuff|thing)\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Avoid placeholder names like foo, stuff or data2.

## Bad
~~~~
const stuff = await load()
~~~~

## Good
~~~~
const invoices = await load()
~~~~
