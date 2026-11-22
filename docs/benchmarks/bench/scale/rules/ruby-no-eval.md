---
kind: forbid
pattern: '(?<![\w.])(?:eval|instance_eval|class_eval)\(\s*[a-z]'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (security)
---
Do not eval strings.

## Bad
~~~~
eval(code)
~~~~

## Good
~~~~
public_send(method_name)
~~~~
