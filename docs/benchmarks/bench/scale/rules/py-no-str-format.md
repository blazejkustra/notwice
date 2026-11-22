---
kind: forbid
pattern: '[''"][^''"\n]*\{\}[^''"\n]*[''"]\.format\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Use f-strings instead of str.format().

## Bad
~~~~
msg = "Hello {}".format(name)
~~~~

## Good
~~~~
msg = f"Hello {name}"
~~~~
