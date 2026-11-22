---
kind: forbid
pattern: '\{\{[^}]*\|\s*\w+\s*\}\}'
targets: [files]
paths: ['*.vue']
severity: block
from: benchmark distractor (framework)
---
Vue 3 removed filters; use computed values or methods.

## Bad
~~~~
<p>{{ price | currency }}</p>
~~~~

## Good
~~~~
<p>{{ formatCurrency(price) }}</p>
~~~~
