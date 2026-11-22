---
kind: forbid
pattern: '\bxox[pe]-[0-9]{10,13}-[0-9]{10,13}-[0-9]{10,13}-[a-f0-9]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Slack user token belongs in the secret manager, never in the repo. Reference SLACK_USER_TOKEN instead.

## Bad
~~~~
SLACK_USER_TOKEN=xoxp-242942050465-604518059982-8287076503582-9e96361da750c04499cf41c43b66ef99
~~~~

## Good
~~~~
SLACK_USER_TOKEN=${SLACK_USER_TOKEN}
~~~~
