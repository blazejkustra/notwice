---
kind: forbid
pattern: '\.__iterator__\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use Symbol.iterator, never __iterator__.

## Bad
~~~~
obj.__iterator__ = gen
~~~~

## Good
~~~~
obj[Symbol.iterator] = gen
~~~~
