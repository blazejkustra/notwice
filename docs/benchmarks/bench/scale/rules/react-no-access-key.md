---
kind: forbid
pattern: '\baccessKey='
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Do not use accessKey; it clashes with assistive tech shortcuts.

## Bad
~~~~
<button accessKey="s">Save</button>
~~~~

## Good
~~~~
<button>Save</button>
~~~~
