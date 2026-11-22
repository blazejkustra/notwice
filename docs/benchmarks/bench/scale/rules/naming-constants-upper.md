---
kind: forbid
pattern: '^\s*export\s+const\s+(?:max|min|default)[A-Z]\w*\s*=\s*\d'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Exported numeric constants are SCREAMING_SNAKE_CASE.

## Bad
~~~~
export const maxRetries = 3
~~~~

## Good
~~~~
export const MAX_RETRIES = 3
~~~~
