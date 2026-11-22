---
kind: forbid
pattern: '\bdynamic\s+\w+\s*='
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Avoid dynamic; use typed models.

## Bad
~~~~
dynamic payload = JsonConvert.DeserializeObject(json);
~~~~

## Good
~~~~
var payload = JsonSerializer.Deserialize<Payload>(json);
~~~~
