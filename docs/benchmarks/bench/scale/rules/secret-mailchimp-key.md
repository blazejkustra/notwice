---
kind: forbid
pattern: '\b[0-9a-f]{32}-us\d{1,2}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Mailchimp API key. Read it from MAILCHIMP_API_KEY at runtime.

## Bad
~~~~
MAILCHIMP_API_KEY=7f26f18069cce5c970d53d95f8a36b2f-us14
~~~~

## Good
~~~~
MAILCHIMP_API_KEY=${MAILCHIMP_API_KEY}
~~~~
