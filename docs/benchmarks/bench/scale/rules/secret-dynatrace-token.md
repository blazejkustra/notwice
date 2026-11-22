---
kind: forbid
pattern: '\bdt0c01\.[A-Z0-9]{24}\.[A-Z0-9]{64}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Dynatrace API token anywhere in the repo or on GitHub; pass it through DT_API_TOKEN.

## Bad
~~~~
DT_API_TOKEN=dt0c01.8N8I60KR3859D3YGG0A3Z1B4.QIBWUJKFRS90TY57AGUG1VP67FM68GCLS9PGMM43B8ASJOX3G0GRZ4TTBX9BT8SL
~~~~

## Good
~~~~
DT_API_TOKEN=${DT_API_TOKEN}
~~~~
