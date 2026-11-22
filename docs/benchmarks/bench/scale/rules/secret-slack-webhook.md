---
kind: forbid
pattern: 'hooks\.slack\.com/(?:services|workflows)/[A-Za-z0-9+/]{43,46}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Slack webhook URL. Read it from SLACK_WEBHOOK_URL at runtime.

## Bad
~~~~
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/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
~~~~

## Good
~~~~
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
~~~~
