---
kind: forbid
pattern: '^\s*return\s+await\s+(?!.*\btry\b)'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: warn
from: benchmark distractor (language)
---
Drop the await in return await outside try blocks.

## Bad
~~~~
  return await fetchUser(id)
~~~~

## Good
~~~~
  return fetchUser(id)
~~~~
