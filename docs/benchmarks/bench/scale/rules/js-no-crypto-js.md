---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]crypto-js(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace crypto-js with the Web Crypto API.

## Bad
~~~~
import cryptoJs from 'crypto-js'
~~~~

## Good
~~~~
const digest = await crypto.subtle.digest("SHA-256", data)
~~~~
