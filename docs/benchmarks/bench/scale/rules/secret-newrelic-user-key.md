---
kind: forbid
pattern: '\bNRAK-[A-Z0-9]{27}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No New Relic user API key in code, commits, PRs or comments; load it from the environment (NEW_RELIC_API_KEY).

## Bad
~~~~
NEW_RELIC_API_KEY=NRAK-OMYJ8GDJYXPANY632S6BEYYFGF5
~~~~

## Good
~~~~
NEW_RELIC_API_KEY=${NEW_RELIC_API_KEY}
~~~~
