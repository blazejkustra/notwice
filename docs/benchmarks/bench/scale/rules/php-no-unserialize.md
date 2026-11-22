---
kind: forbid
pattern: '(?<![\w>])unserialize\('
targets: [files]
paths: ['*.php']
severity: block
from: benchmark distractor (security)
---
Never unserialize untrusted data; use json_decode.

## Bad
~~~~
$cart = unserialize($_COOKIE["cart"]);
~~~~

## Good
~~~~
$cart = json_decode($payload, true);
~~~~
