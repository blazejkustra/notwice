---
kind: forbid
pattern: '[''"][^''"\n]*%[sdr][^''"\n]*[''"]\s*%\s*[(\w]'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Use f-strings instead of % formatting.

## Bad
~~~~
msg = "Hello %s" % name
~~~~

## Good
~~~~
msg = f"Hello {name}"
~~~~
