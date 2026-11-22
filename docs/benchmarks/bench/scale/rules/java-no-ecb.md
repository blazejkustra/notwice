---
kind: forbid
pattern: 'Cipher\.getInstance\(\s*"[^"]*/ECB/'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (security)
---
Never use ECB mode; use AES/GCM.

## Bad
~~~~
Cipher.getInstance("AES/ECB/PKCS5Padding")
~~~~

## Good
~~~~
Cipher.getInstance("AES/GCM/NoPadding")
~~~~
