---
kind: forbid
pattern: '\bAIza[0-9A-Za-z_-]{35}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Google API key belongs in the secret manager, never in the repo. Reference GOOGLE_API_KEY instead.

## Bad
~~~~
GOOGLE_API_KEY=AIzasxgVUUOdVwGh5dZp6zKj9rdcoGxvNxVUYcz
~~~~

## Good
~~~~
GOOGLE_API_KEY=${GOOGLE_API_KEY}
~~~~
