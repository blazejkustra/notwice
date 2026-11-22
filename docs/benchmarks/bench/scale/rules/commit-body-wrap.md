---
kind: forbid
pattern: '^.{73,}$'
targets: [commits]
severity: block
from: benchmark distractor (git)
---
Wrap commit message lines at 72 characters.

## Bad
~~~~
Add slugify helper that lowercases text, trims it and joins the words with dashes
~~~~

## Good
~~~~
Add slugify helper

Lowercases text, trims it and joins the words with dashes.
~~~~
