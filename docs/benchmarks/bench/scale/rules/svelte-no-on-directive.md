---
kind: forbid
pattern: '\bon:(?:click|input|submit|change)='
targets: [files]
paths: ['*.svelte']
severity: block
from: benchmark distractor (framework)
---
Svelte 5: use onclick attributes instead of on:click.

## Bad
~~~~
<button on:click={save}>
~~~~

## Good
~~~~
<button onclick={save}>
~~~~
