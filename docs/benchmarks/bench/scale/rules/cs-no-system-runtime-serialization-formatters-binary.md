---
kind: forbid
pattern: '^\s*using\s+System\.Runtime\.Serialization\.Formatters\.Binary\s*;'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on System.Runtime.Serialization.Formatters.Binary; reach for System.Text.Json.

## Bad
~~~~
using System.Runtime.Serialization.Formatters.Binary;
~~~~

## Good
~~~~
using System.Text.Json;
~~~~
