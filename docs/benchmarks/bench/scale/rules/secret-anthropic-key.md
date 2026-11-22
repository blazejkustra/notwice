---
kind: forbid
pattern: '\bsk-ant-(?:api|admin)\d{2}-[A-Za-z0-9_-]{80,}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Anthropic API key. Read it from ANTHROPIC_API_KEY at runtime.

## Bad
~~~~
ANTHROPIC_API_KEY=sk-ant-api03-cB7AipGWvwsR871IZ6J36twOznB8Rf4HDg78enjLcEN6BICCMWhgfd0wBrtrxI3oVVrVp0tvUzM6nKPFMAvEjDym5KX8A
~~~~

## Good
~~~~
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
~~~~
