---
kind: forbid
pattern: '\bjwt\.decode\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Verify tokens with jwt.verify; jwt.decode does not check the signature.

## Bad
~~~~
const user = jwt.decode(token)
~~~~

## Good
~~~~
const user = jwt.verify(token, publicKey)
~~~~
