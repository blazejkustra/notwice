---
kind: forbid
pattern: 'localStorage\.setItem\(\s*[''"](?:token|access_token|jwt|auth)[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Never keep auth tokens in localStorage; use httpOnly cookies.

## Bad
~~~~
localStorage.setItem("token", jwt)
~~~~

## Good
~~~~
await session.refresh()
~~~~
