---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/ghodss\/yaml(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Replace github.com/ghodss/yaml with sigs.k8s.io/yaml.

## Bad
~~~~
import "github.com/ghodss/yaml"
~~~~

## Good
~~~~
"sigs.k8s.io/yaml"
~~~~
