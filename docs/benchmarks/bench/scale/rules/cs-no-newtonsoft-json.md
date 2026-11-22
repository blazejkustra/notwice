---
kind: forbid
pattern: '^\s*using\s+Newtonsoft\.Json\s*;'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (dependencies)
---
Replace Newtonsoft.Json with System.Text.Json.

## Bad
~~~~
using Newtonsoft.Json;
~~~~

## Good
~~~~
using System.Text.Json;
~~~~
