---
kind: forbid
pattern: 'NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*[''"]?0|rejectUnauthorized:\s*false'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Never turn off TLS certificate checks.

## Bad
~~~~
const agent = new https.Agent({ rejectUnauthorized: false })
~~~~

## Good
~~~~
const agent = new https.Agent({ ca: corporateCa })
~~~~
