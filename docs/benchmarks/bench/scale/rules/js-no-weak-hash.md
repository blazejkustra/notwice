---
kind: forbid
pattern: 'createHash\(\s*[''"](?:md5|sha1)[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Do not use MD5 or SHA-1 for anything security related.

## Bad
~~~~
crypto.createHash("md5").update(password)
~~~~

## Good
~~~~
crypto.createHash("sha256").update(file)
~~~~
