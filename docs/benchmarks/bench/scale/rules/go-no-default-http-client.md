---
kind: forbid
pattern: '\bhttp\.(?:Get|Post|Head)\('
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
Do not use the default HTTP client; it has no timeout.

## Bad
~~~~
resp, err := http.Get(url)
~~~~

## Good
~~~~
resp, err := client.Get(url)
~~~~
