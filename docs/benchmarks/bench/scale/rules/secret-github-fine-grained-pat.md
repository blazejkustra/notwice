---
kind: forbid
pattern: '\bgithub_pat_[A-Za-z0-9_]{82}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No GitHub fine-grained token in code, commits, PRs or comments; load it from the environment (GITHUB_TOKEN).

## Bad
~~~~
GITHUB_TOKEN=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
~~~~

## Good
~~~~
GITHUB_TOKEN=${GITHUB_TOKEN}
~~~~
