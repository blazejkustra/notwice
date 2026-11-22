---
kind: forbid
pattern: 'https://[0-9a-f]{32}@o\d+\.ingest\.(?:us\.)?sentry\.io/\d+'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Sentry DSN anywhere in the repo or on GitHub; pass it through SENTRY_DSN.

## Bad
~~~~
SENTRY_DSN=https://c0995d9741695a096ada9756499ea044@o583131.ingest.sentry.io/2211722
~~~~

## Good
~~~~
SENTRY_DSN=${SENTRY_DSN}
~~~~
