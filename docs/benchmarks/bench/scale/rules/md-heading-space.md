---
kind: forbid
pattern: '^#{1,6}[^#\s]'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Put a space after the # in Markdown headings (MD018).

## Bad
~~~~
#Install
~~~~

## Good
~~~~
# Install
~~~~
