---
kind: forbid
pattern: '\bsanity[ -]check'
flags: i
targets: [files, commits, pr, comments]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
"sanity check" is banned in commit messages and PR text: say quick check or smoke test.

## Bad
~~~~
sanity check
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
