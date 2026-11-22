---
kind: forbid
pattern: '\bstyle="'
targets: [files]
paths: ['*.{html,htm}']
severity: block
from: benchmark distractor (language)
---
No inline style attributes in HTML templates.

## Bad
~~~~
<p style="color: red">Error</p>
~~~~

## Good
~~~~
<p class="error">Error</p>
~~~~
