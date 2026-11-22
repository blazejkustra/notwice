---
kind: forbid
pattern: '\.run\([^)]*debug\s*=\s*True'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (framework)
---
Never start Flask with debug=True in code.

## Bad
~~~~
app.run(debug=True)
~~~~

## Good
~~~~
app.run()
~~~~
