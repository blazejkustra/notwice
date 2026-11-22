---
kind: forbid
pattern: 'catch\s*\(\s*\w*\s*\)\s*\{\s*\}'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Never swallow errors with an empty catch block.

## Bad
~~~~
try { load() } catch (e) {}
~~~~

## Good
~~~~
try { load() } catch (error) { report(error) }
~~~~
