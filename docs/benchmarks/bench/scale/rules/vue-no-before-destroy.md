---
kind: forbid
pattern: '\bbeforeDestroy\b|\bdestroyed\s*\('
targets: [files]
paths: ['*.vue']
severity: block
from: benchmark distractor (framework)
---
Vue 3 renamed beforeDestroy and destroyed to beforeUnmount and unmounted.

## Bad
~~~~
beforeDestroy() {
~~~~

## Good
~~~~
beforeUnmount() {
~~~~
