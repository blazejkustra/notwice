---
kind: forbid
pattern: 'href=["'']#["'']'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Links need a real href; use a button for actions.

## Bad
~~~~
<a href="#" onClick={save}>Save</a>
~~~~

## Good
~~~~
<button type="button" onClick={save}>Save</button>
~~~~
