---
kind: forbid
pattern: 'res\.send\(\s*req\.(?:query|params|body)\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
Never echo request input back in a response.

## Bad
~~~~
res.send(req.query.q)
~~~~

## Good
~~~~
res.json({ ok: true })
~~~~
