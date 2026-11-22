---
kind: forbid
pattern: 'discord(?:app)?\.com/api/webhooks/\d+/[\w-]+'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Discord webhook URL. Read it from DISCORD_WEBHOOK_URL at runtime.

## Bad
~~~~
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/028025057134290821/lLBFSrEgm0jXxKA94eD2SW78YDKLsO0LihmpfWz5HaWNNhcVixU5DYlbi7kZVLWEM7kh
~~~~

## Good
~~~~
DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK_URL}
~~~~
