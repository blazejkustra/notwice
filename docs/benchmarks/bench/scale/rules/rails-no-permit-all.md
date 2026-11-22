---
kind: forbid
pattern: '\.permit!'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (framework)
---
Never permit all params; list the allowed keys.

## Bad
~~~~
params.require(:user).permit!
~~~~

## Good
~~~~
params.require(:user).permit(:name, :email)
~~~~
