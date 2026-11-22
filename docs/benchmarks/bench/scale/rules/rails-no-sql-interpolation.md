---
kind: forbid
pattern: '\.(?:where|find_by_sql|order|group|having|joins)\(\s*"[^"]*#\{'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (framework)
---
Never interpolate into SQL fragments; use bind parameters.

## Bad
~~~~
User.where("name = '#{name}'")
~~~~

## Good
~~~~
User.where(name: name)
~~~~
