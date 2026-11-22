---
kind: forbid
pattern: '\blog(?:ger|ging)?\.(?:debug|info|warning|error|exception)\(\s*f[''"]'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Pass logging arguments separately; no f-strings in log calls.

## Bad
~~~~
logger.info(f"user {user_id} logged in")
~~~~

## Good
~~~~
logger.info("user %s logged in", user_id)
~~~~
