---
kind: forbid
pattern: '\bsntry[su]_[A-Za-z0-9+/=_-]{60,}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Sentry auth token. Read it from SENTRY_AUTH_TOKEN at runtime.

## Bad
~~~~
SENTRY_AUTH_TOKEN=sntrys_3NZucyeWSW5YygizgeD3GcQ0XODbgWJaIwF20yB81wrIfH9SSVEN1OM5Bt9mDsPjnPQ0L5kGN9Dde4pY
~~~~

## Good
~~~~
SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
~~~~
