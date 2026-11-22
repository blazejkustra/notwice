---
kind: forbid
pattern: '\bhf_[A-Za-z]{34}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Hugging Face token. Read it from HF_TOKEN at runtime.

## Bad
~~~~
HF_TOKEN=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
~~~~

## Good
~~~~
HF_TOKEN=${HF_TOKEN}
~~~~
