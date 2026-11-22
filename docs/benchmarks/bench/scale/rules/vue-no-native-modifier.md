---
kind: forbid
pattern: '@\w+\.native\b'
targets: [files]
paths: ['*.vue']
severity: block
from: benchmark distractor (framework)
---
The .native modifier is removed in Vue 3.

## Bad
~~~~
<Button @click.native="go" />
~~~~

## Good
~~~~
<Button @click="go" />
~~~~
