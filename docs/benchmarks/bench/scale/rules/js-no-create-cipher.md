---
kind: forbid
pattern: '\bcrypto\.create(?:Cipher|Decipher)\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
createCipher is deprecated and weak; use createCipheriv with a random IV.

## Bad
~~~~
const c = crypto.createCipher("aes192", key)
~~~~

## Good
~~~~
const c = crypto.createCipheriv("aes-256-gcm", key, iv)
~~~~
