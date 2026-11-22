---
kind: forbid
pattern: '\brk_live_[0-9a-zA-Z]{24,99}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Stripe restricted key anywhere in the repo or on GitHub; pass it through STRIPE_RESTRICTED_KEY.

## Bad
~~~~
STRIPE_RESTRICTED_KEY=rk_live_74vWdYaYmmLfcQOIkqqxWesF1UKWcPn2
~~~~

## Good
~~~~
STRIPE_RESTRICTED_KEY=${STRIPE_RESTRICTED_KEY}
~~~~
