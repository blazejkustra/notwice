---
kind: forbid
pattern: '//\s*(?:HACK|XXX)\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No HACK or XXX comments; file a ticket and explain the constraint.

## Bad
~~~~
// HACK: wait for the animation
~~~~

## Good
~~~~
// The animation ends after 300 ms (see UI-88).
~~~~
