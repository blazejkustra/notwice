---
kind: forbid
pattern: '\.(?:Result|GetAwaiter\(\)\.GetResult\(\))\b(?!\s*=)'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Do not block on tasks with .Result; await them.

## Bad
~~~~
var user = client.GetUserAsync(id).Result;
~~~~

## Good
~~~~
var user = await client.GetUserAsync(id);
~~~~
