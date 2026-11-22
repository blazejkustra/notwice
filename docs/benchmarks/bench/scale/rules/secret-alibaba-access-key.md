---
kind: forbid
pattern: '\bLTAI[a-zA-Z0-9]{20}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Alibaba Cloud access key in code, commits, PRs or comments; load it from the environment (ALIBABA_ACCESS_KEY_ID).

## Bad
~~~~
ALIBABA_ACCESS_KEY_ID=LTAI4kukOnx2xY9S1OZnbKD6
~~~~

## Good
~~~~
ALIBABA_ACCESS_KEY_ID=${ALIBABA_ACCESS_KEY_ID}
~~~~
