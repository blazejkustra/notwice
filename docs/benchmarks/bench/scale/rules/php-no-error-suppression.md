---
kind: forbid
pattern: '(?<![\w)])@\$?[a-z_]+\('
targets: [files]
paths: ['*.php']
severity: block
from: benchmark distractor (language)
---
Do not suppress errors with @.

## Bad
~~~~
$data = @file_get_contents($path);
~~~~

## Good
~~~~
$data = file_get_contents($path);
~~~~
