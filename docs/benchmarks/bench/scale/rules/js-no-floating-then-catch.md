---
kind: forbid
pattern: '\.then\([^)]*\)\s*;\s*$'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: warn
from: benchmark distractor (language)
---
Handle promise rejections: add .catch() or await the promise.

## Bad
~~~~
save(doc).then(close);
~~~~

## Good
~~~~
await save(doc); close()
~~~~
