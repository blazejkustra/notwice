---
kind: forbid
pattern: '\b(?:white|black)[ -]?list(?:s|ed|ing)?\b'
flags: i
targets: [files, commits, pr, comments]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
Do not write "whitelist or blacklist" in commits, PRs or comments; say allowlist or denylist.

## Bad
~~~~
whitelist or blacklist
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
