---
kind: forbid
pattern: '\{@html\b'
targets: [files]
paths: ['*.svelte']
severity: block
from: benchmark distractor (framework)
---
Avoid {@html}; render text or sanitize first.

## Bad
~~~~
{@html post.body}
~~~~

## Good
~~~~
{post.body}
~~~~
