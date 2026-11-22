---
kind: forbid
pattern: '(?<![\w>])extract\('
targets: [files]
paths: ['*.php']
severity: block
from: benchmark distractor (language)
---
Do not use extract(); read array keys explicitly.

## Bad
~~~~
extract($_POST);
~~~~

## Good
~~~~
$name = $request->input("name");
~~~~
