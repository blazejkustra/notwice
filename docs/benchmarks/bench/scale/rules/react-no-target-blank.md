---
kind: forbid
pattern: 'target="_blank"(?![^>]*\brel=)'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Links with target="_blank" need rel="noreferrer".

## Bad
~~~~
<a href={url} target="_blank">Docs</a>
~~~~

## Good
~~~~
<a href={url} target="_blank" rel="noreferrer">Docs</a>
~~~~
