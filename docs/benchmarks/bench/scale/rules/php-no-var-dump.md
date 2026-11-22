---
kind: forbid
pattern: '\b(?:var_dump|print_r|dd|dump)\('
targets: [files]
paths: ['*.php']
severity: block
from: benchmark distractor (language)
---
Remove var_dump, print_r, dd and dump before committing.

## Bad
~~~~
var_dump($user);
~~~~

## Good
~~~~
$logger->debug("user", ["id" => $user->id]);
~~~~
