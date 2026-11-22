---
kind: forbid
pattern: '\bv-for="[^"]*"[^>]*\bv-if=|\bv-if="[^"]*"[^>]*\bv-for='
targets: [files]
paths: ['*.vue']
severity: block
from: benchmark distractor (framework)
---
Never put v-if and v-for on the same element.

## Bad
~~~~
<li v-for="u in users" v-if="u.active">
~~~~

## Good
~~~~
<li v-for="u in activeUsers">
~~~~
