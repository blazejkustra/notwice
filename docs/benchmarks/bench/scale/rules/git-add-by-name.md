---
kind: forbid
pattern: '\bgit\s+(?:add\s+(?:[^;&|\n]*\s)?(?:-A|--all|-u|\.)(?=\s|$|[;&|)])|commit\s+(?:[^;&|\n]*\s)?(?<!-)-[a-zA-Z]*a[a-zA-Z]*\b)'
targets: [commands]
severity: block
from: benchmark distractor (git)
---
Stage files by name. Never use git add -A, git add --all, git add . or git commit -a.

## Bad
~~~~
git add -A && git commit -m "Add slugify"
~~~~

## Good
~~~~
git add src/slugify.js test/slugify.test.js
~~~~
