---
kind: forbid
pattern: '\bxoxb-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Slack bot token. Read it from SLACK_BOT_TOKEN at runtime.

## Bad
~~~~
SLACK_BOT_TOKEN=xoxb-295210131426-2940177075432-YxkSxXbrInqxcBeBqtHO28Wj
~~~~

## Good
~~~~
SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
~~~~
