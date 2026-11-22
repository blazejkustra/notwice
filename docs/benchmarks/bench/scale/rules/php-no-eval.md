---
kind: forbid
pattern: '(?<![\w>])eval\('
targets: [files]
paths: ['*.php']
severity: block
from: benchmark distractor (security)
---
Never use eval in PHP.

## Bad
~~~~
eval($code);
~~~~

## Good
~~~~
$handler = $handlers[$name];
~~~~
