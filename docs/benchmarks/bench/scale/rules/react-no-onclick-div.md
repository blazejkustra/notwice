---
kind: forbid
pattern: '<div\b[^>]*\bonClick='
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Do not put onClick on a div; use a button.

## Bad
~~~~
<div onClick={open}>Open</div>
~~~~

## Good
~~~~
<button type="button" onClick={open}>Open</button>
~~~~
