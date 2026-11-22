---
kind: forbid
pattern: '(?<![\w.])system\('
targets: [files]
paths: ['*.{c,h}']
severity: block
from: benchmark distractor (language)
---
Do not call system(); use exec* with an argument vector.

## Bad
~~~~
system(command);
~~~~

## Good
~~~~
execvp(argv[0], argv);
~~~~
