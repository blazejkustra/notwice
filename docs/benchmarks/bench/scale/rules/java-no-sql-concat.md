---
kind: forbid
pattern: '(?:executeQuery|executeUpdate|prepareStatement)\(\s*"[^"]*"\s*\+'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (security)
---
Never concatenate SQL; use bind parameters.

## Bad
~~~~
stmt.executeQuery("SELECT * FROM users WHERE id = " + id)
~~~~

## Good
~~~~
conn.prepareStatement("SELECT * FROM users WHERE id = ?")
~~~~
