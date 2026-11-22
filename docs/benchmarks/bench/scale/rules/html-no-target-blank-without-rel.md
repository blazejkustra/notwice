---
kind: forbid
pattern: 'target="_blank"(?![^>]*\brel=)'
targets: [files]
paths: ['*.{html,htm}']
severity: block
from: benchmark distractor (language)
---
Links with target="_blank" need rel="noopener".

## Bad
~~~~
<a href="/docs" target="_blank">Docs</a>
~~~~

## Good
~~~~
<a href="/docs" target="_blank" rel="noopener">Docs</a>
~~~~
