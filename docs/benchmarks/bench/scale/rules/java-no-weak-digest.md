---
kind: forbid
pattern: 'MessageDigest\.getInstance\(\s*"(?:MD5|SHA-?1)"'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (security)
---
Do not use MD5 or SHA-1 digests.

## Bad
~~~~
MessageDigest.getInstance("MD5")
~~~~

## Good
~~~~
MessageDigest.getInstance("SHA-256")
~~~~
