---
kind: forbid
pattern: 'algorithms:\s*\[\s*[''"]none[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Never accept the none algorithm for JWTs.

## Bad
~~~~
jwt.verify(token, key, { algorithms: ["none"] })
~~~~

## Good
~~~~
jwt.verify(token, key, { algorithms: ["RS256"] })
~~~~
