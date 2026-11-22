---
kind: forbid
pattern: '\bEAAA[a-zA-Z0-9_-]{60}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Square access token belongs in the secret manager, never in the repo. Reference SQUARE_ACCESS_TOKEN instead.

## Bad
~~~~
SQUARE_ACCESS_TOKEN=EAAAbExBqXa5hTGfk8QC4KQgtw1Kf66hFyXZLzOsUERZ6cwdOzPlQdR9SdgHHuEY
~~~~

## Good
~~~~
SQUARE_ACCESS_TOKEN=${SQUARE_ACCESS_TOKEN}
~~~~
