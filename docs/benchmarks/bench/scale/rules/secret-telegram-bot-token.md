---
kind: forbid
pattern: '\b\d{8,10}:AA[0-9A-Za-z_-]{33}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Telegram bot token in code, commits, PRs or comments; load it from the environment (TELEGRAM_BOT_TOKEN).

## Bad
~~~~
TELEGRAM_BOT_TOKEN=1010303828:AAoqrpdEYOLy0ZUuVNChedwBlBEmKBfMA0e
~~~~

## Good
~~~~
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
~~~~
