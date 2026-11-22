---
kind: forbid
pattern: '\bhashlib\.(?:md5|sha1)\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Do not use MD5 or SHA-1 for security; use hashlib.sha256 or a password hasher.

## Bad
~~~~
digest = hashlib.md5(password).hexdigest()
~~~~

## Good
~~~~
digest = hashlib.sha256(data).hexdigest()
~~~~
