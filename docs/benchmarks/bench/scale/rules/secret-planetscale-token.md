---
kind: forbid
pattern: '\bpscale_tkn_[A-Za-z0-9=._-]{32,64}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a PlanetScale service token. Read it from PLANETSCALE_TOKEN at runtime.

## Bad
~~~~
PLANETSCALE_TOKEN=pscale_tkn_d4ANwyjrKltEQmKg9fO19KRuiTY0uiPnpAS3w4eVGE4
~~~~

## Good
~~~~
PLANETSCALE_TOKEN=${PLANETSCALE_TOKEN}
~~~~
