---
kind: forbid
pattern: '\bAGE-SECRET-KEY-1[0-9A-Z]{58}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a age secret key anywhere in the repo or on GitHub; pass it through SOPS_AGE_KEY.

## Bad
~~~~
SOPS_AGE_KEY=AGE-SECRET-KEY-1S2NMYPTE1MZFQ25DU6X58ZP2X37Q9X2U49RH2OL4F6NHQOSTFBYVH0ME90
~~~~

## Good
~~~~
SOPS_AGE_KEY=${SOPS_AGE_KEY}
~~~~
