---
kind: forbid
pattern: '\bwhsec_[A-Za-z0-9]{32,}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Stripe webhook signing secret. Read it from STRIPE_WEBHOOK_SECRET at runtime.

## Bad
~~~~
STRIPE_WEBHOOK_SECRET=whsec_T1eQYyvzUhaxcywmdXcdDZZu08zyRqz2
~~~~

## Good
~~~~
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
~~~~
