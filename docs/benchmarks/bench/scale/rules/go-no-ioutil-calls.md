---
kind: forbid
pattern: '\bioutil\.(?:ReadAll|ReadFile|WriteFile|ReadDir|TempDir|TempFile)\('
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
ioutil is deprecated; use io and os.

## Bad
~~~~
data, err := ioutil.ReadFile(path)
~~~~

## Good
~~~~
data, err := os.ReadFile(path)
~~~~
