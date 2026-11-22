---
kind: forbid
pattern: '^\s*export\s+let\s+\w+'
targets: [files]
paths: ['*.svelte']
severity: block
from: benchmark distractor (framework)
---
Svelte 5: declare props with $props(), not export let.

## Bad
~~~~
export let title
~~~~

## Good
~~~~
let { title } = $props()
~~~~
