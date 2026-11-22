---
kind: forbid
pattern: '"auth":\s*"[A-Za-z0-9+/=]{20,}"'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Docker registry auth anywhere in the repo or on GitHub; pass it through DOCKER_AUTH_CONFIG.

## Bad
~~~~
"auth": "ElV3rz5xkiO1qXQOGEkYlya7IOukENUJ35dLSrwZ"
~~~~

## Good
~~~~
DOCKER_AUTH_CONFIG=${DOCKER_AUTH_CONFIG}
~~~~
