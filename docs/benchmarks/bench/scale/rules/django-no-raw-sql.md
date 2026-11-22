---
kind: forbid
pattern: '\.(?:extra|raw)\(\s*f?[''"]'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (framework)
---
Do not use .extra() or .raw() with SQL strings; use the ORM or params.

## Bad
~~~~
User.objects.raw(f"SELECT * FROM users WHERE id={uid}")
~~~~

## Good
~~~~
User.objects.filter(id=uid)
~~~~
