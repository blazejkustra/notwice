---
kind: forbid
pattern: '(?<![\w.<])@[A-Za-z][\w-]{1,38}\b(?![\w.-]*\.\w)'
targets: [commits]
severity: block
from: benchmark distractor (git)
---
No @mentions in commit messages; they notify people on every rebase.

## Bad
~~~~
Thanks @octocat for the report
~~~~

## Good
~~~~
Reported in issue #88
~~~~
