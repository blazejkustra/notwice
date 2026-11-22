---
kind: forbid
pattern: '\.save!?\(\s*validate:\s*false'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (framework)
---
Never save with validate: false.

## Bad
~~~~
order.save(validate: false)
~~~~

## Good
~~~~
order.save!
~~~~
