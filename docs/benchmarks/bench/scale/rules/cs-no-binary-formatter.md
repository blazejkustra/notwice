---
kind: forbid
pattern: '\bBinaryFormatter\b'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (security)
---
BinaryFormatter is insecure and removed; use System.Text.Json.

## Bad
~~~~
var formatter = new BinaryFormatter();
~~~~

## Good
~~~~
var json = JsonSerializer.Serialize(model);
~~~~
