---
kind: forbid
pattern: '\bmd5\(\s*\$(?:password|pass|pwd)\b'
targets: [files]
paths: ['*.php']
severity: block
from: benchmark distractor (security)
---
Hash passwords with password_hash, never md5.

## Bad
~~~~
$hash = md5($password);
~~~~

## Good
~~~~
$hash = password_hash($password, PASSWORD_DEFAULT);
~~~~
