---
kind: forbid
pattern: '\bpul-[a-f0-9]{40}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Pulumi access token. Read it from PULUMI_ACCESS_TOKEN at runtime.

## Bad
~~~~
PULUMI_ACCESS_TOKEN=pul-a20b28a9ba68cbe1db94156097c61a2d90afce45
~~~~

## Good
~~~~
PULUMI_ACCESS_TOKEN=${PULUMI_ACCESS_TOKEN}
~~~~
