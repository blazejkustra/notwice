---
kind: forbid
pattern: '\bxapp-\d-[A-Z0-9]+-\d+-[a-f0-9]+\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Slack app-level token belongs in the secret manager, never in the repo. Reference SLACK_APP_TOKEN instead.

## Bad
~~~~
SLACK_APP_TOKEN=xapp-1-A40ZEPFDX5A-4626838355967-632b32470735b0fd6eefef366f14ba3ab9b63aa1f3075c65d2a6ed93886093b7
~~~~

## Good
~~~~
SLACK_APP_TOKEN=${SLACK_APP_TOKEN}
~~~~
