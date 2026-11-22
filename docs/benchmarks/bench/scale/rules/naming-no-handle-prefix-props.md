---
kind: forbid
pattern: '\bhandle[A-Z]\w*=\{'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (naming)
---
Props are named onX; handlers are named handleX.

## Bad
~~~~
<Button handleClick={save} />
~~~~

## Good
~~~~
<Button onClick={save} />
~~~~
