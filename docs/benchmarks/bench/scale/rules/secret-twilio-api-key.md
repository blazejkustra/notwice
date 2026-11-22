---
kind: forbid
pattern: '\bSK[0-9a-fA-F]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Twilio API key in code, commits, PRs or comments; load it from the environment (TWILIO_API_KEY).

## Bad
~~~~
TWILIO_API_KEY=SKd17799afe6cc6f0f699cab13139821a8
~~~~

## Good
~~~~
TWILIO_API_KEY=${TWILIO_API_KEY}
~~~~
