---
kind: forbid
pattern: '^\w*(?:KEY|SECRET|TOKEN|PASSWORD)\w*=(?!$|your-|changeme|<|\$\{)\S{12,}'
targets: [files]
paths: ['.env', '.env.*']
severity: block
from: benchmark distractor (infra)
---
Never commit real values in .env files; commit .env.example with placeholders.

## Bad
~~~~
STRIPE_SECRET_KEY=sk_test_51abcdefghijk
~~~~

## Good
~~~~
STRIPE_SECRET_KEY=your-key-here
~~~~
