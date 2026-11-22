---
kind: forbid
pattern: '\bico-[A-Za-z0-9]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Infracost API key in code, commits, PRs or comments; load it from the environment (INFRACOST_API_KEY).

## Bad
~~~~
INFRACOST_API_KEY=ico-LEac8YdFhtFGRIdFqxkimJxfRA2twf5R
~~~~

## Good
~~~~
INFRACOST_API_KEY=${INFRACOST_API_KEY}
~~~~
