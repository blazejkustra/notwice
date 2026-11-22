---
kind: forbid
pattern: '\bgit\s+push\b[^;&|\n]*\b(?:gh-pages|screenshots|assets)-?branch\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not push media branches; attach files to the PR.

## Bad
~~~~
git push origin screenshots-branch
~~~~

## Good
~~~~
gh pr comment 12 --body "see attachment"
~~~~
