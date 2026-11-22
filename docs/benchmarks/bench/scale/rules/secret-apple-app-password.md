---
kind: forbid
pattern: '(?:app.?specific|apple.?id.?password).{0,20}[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z]{4}'
flags: i
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Apple app-specific password. Read it from APP_SPECIFIC_PASSWORD at runtime.

## Bad
~~~~
APP_SPECIFIC_PASSWORD=abcd-efgh-ijkl-mnop
~~~~

## Good
~~~~
APP_SPECIFIC_PASSWORD=${APP_SPECIFIC_PASSWORD}
~~~~
