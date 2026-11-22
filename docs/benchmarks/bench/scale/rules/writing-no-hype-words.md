---
kind: forbid
pattern: '\b(?:robust(?:ly|ness)?|seamless(?:ly)?|comprehensive(?:ly)?|leverag(?:e|es|ed|ing)|utiliz(?:e|es|ed|ing|ation)|delv(?:e|es|ed|ing))\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (style)
---
No hype words in commits, PRs or comments: robust, seamless, comprehensive, leverage, utilize, delve.

## Bad
~~~~
Add robust slug handling
~~~~

## Good
~~~~
Add slug handling for accented letters
~~~~
