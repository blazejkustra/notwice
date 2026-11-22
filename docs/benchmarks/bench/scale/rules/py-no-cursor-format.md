---
kind: forbid
pattern: '\.execute\(\s*f[''"]|\.execute\([^)]*[''"]\s*%\s*\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Pass SQL parameters to execute(); never format them into the string.

## Bad
~~~~
cur.execute(f"SELECT * FROM users WHERE name = '{name}'")
~~~~

## Good
~~~~
cur.execute("SELECT * FROM users WHERE name = %s", (name,))
~~~~
