---
kind: forbid
pattern: 'process\.env\.[a-z]\w*'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Environment variable names are SCREAMING_SNAKE_CASE.

## Bad
~~~~
const url = process.env.databaseUrl
~~~~

## Good
~~~~
const url = process.env.DATABASE_URL
~~~~
