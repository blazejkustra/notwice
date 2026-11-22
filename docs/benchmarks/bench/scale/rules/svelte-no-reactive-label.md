---
kind: forbid
pattern: '^\s*\$:\s'
targets: [files]
paths: ['*.svelte']
severity: block
from: benchmark distractor (framework)
---
Svelte 5: use $derived or $effect instead of $: statements.

## Bad
~~~~
$: total = price * qty
~~~~

## Good
~~~~
let total = $derived(price * qty)
~~~~
