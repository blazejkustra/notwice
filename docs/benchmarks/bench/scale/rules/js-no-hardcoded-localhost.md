---
kind: forbid
pattern: '[''"]https?://localhost:\d+'
targets: [files]
paths: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx}', 'lib/**/*.{js,mjs,cjs,ts}']
severity: block
from: benchmark distractor (security)
---
No hardcoded localhost URLs in source; read the base URL from config.

## Bad
~~~~
const api = "http://localhost:3000"
~~~~

## Good
~~~~
const api = config.apiBaseUrl
~~~~
