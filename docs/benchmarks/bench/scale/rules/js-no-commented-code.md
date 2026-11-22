---
kind: forbid
pattern: '^\s*//\s*(?:const|let|var|function|return|import|export|if\s*\(|for\s*\()\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Delete commented-out code; git keeps the history.

## Bad
~~~~
// const legacy = loadLegacy()
~~~~

## Good
~~~~
// Legacy loading was removed in v3.
~~~~
