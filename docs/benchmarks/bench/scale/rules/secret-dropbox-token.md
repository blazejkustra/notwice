---
kind: forbid
pattern: '\bsl\.[A-Za-z0-9_-]{130,}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Dropbox access token belongs in the secret manager, never in the repo. Reference DROPBOX_TOKEN instead.

## Bad
~~~~
DROPBOX_TOKEN=sl.5sxzLMoaZhbgTu6UuhFqpEvz54sVYX0724jNwhWa4iqijZRAZgPzvYE04xvPN1l7EZIqpI8ycjrQTwnSCC5A4JlrJ6nKRiUcRYZcgXrVoeRu47tjKf0oVPrkQ6mc8NKY1TOi0iUXfPoE
~~~~

## Good
~~~~
DROPBOX_TOKEN=${DROPBOX_TOKEN}
~~~~
