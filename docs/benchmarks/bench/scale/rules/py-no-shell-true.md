---
kind: forbid
pattern: 'shell\s*=\s*True'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Never call subprocess with shell=True; pass an argument list.

## Bad
~~~~
subprocess.run(cmd, shell=True)
~~~~

## Good
~~~~
subprocess.run(["git", "status"], check=True)
~~~~
