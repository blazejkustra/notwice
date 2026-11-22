---
kind: forbid
pattern: '\b(?:curl|wget)\b[^|\n]*\|\s*(?:sudo\s+)?(?:ba|z)?sh\b'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (security)
---
Never pipe a download into a shell; download, verify, then run.

## Bad
~~~~
curl -fsSL https://get.example.sh | sh
~~~~

## Good
~~~~
curl -fsSLo install.sh https://get.example.sh && sha256sum -c install.sh.sha256
~~~~
