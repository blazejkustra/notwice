---
kind: forbid
pattern: '\bCLOJARS_[a-z0-9]{60}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Clojars deploy token. Read it from CLOJARS_TOKEN at runtime.

## Bad
~~~~
CLOJARS_TOKEN=CLOJARS_awb5khgalu7cat6o6okwvy6em43mroewnajwl2s4otti8bamhxzjs708fgg6
~~~~

## Good
~~~~
CLOJARS_TOKEN=${CLOJARS_TOKEN}
~~~~
