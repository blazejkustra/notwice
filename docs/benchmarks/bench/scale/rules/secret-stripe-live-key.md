---
kind: forbid
pattern: '\bsk_live_[0-9a-zA-Z]{24,99}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Stripe live secret key. Read it from STRIPE_SECRET_KEY at runtime.

## Bad
~~~~
STRIPE_SECRET_KEY=sk_live_srQxKZbd2GwQA7rJrjDc40eNpGKGJYwa
~~~~

## Good
~~~~
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
~~~~
