---
kind: forbid
pattern: '^\s*(?:\*\*?|__?)[^*_\s][^*_]*(?:\*\*?|__?)\s*$'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (style)
---
In Markdown, never use a bold or italic line as a heading or tagline (MD036). Write a plain sentence or a real heading.

## Bad
~~~~
*Fast CSV cleanup for everyone.*
~~~~

## Good
~~~~
Fast CSV cleanup for everyone.
~~~~
