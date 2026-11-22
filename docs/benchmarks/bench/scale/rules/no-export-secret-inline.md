---
kind: forbid
pattern: '\bexport\s+\w*(?:SECRET|TOKEN|PASSWORD|API_KEY)\w*=[''"]?[A-Za-z0-9_\-]{12,}'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not paste secret values into commands; load them from the keychain or a file.

## Bad
~~~~
export STRIPE_SECRET_KEY=sk_test_abcdefghijklmnop
~~~~

## Good
~~~~
export STRIPE_SECRET_KEY="$(op read op://dev/stripe/key)"
~~~~
