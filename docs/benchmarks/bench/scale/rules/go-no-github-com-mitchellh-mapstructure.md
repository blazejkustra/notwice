---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/mitchellh\/mapstructure(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Do not import github.com/mitchellh/mapstructure; use github.com/go-viper/mapstructure/v2.

## Bad
~~~~
import "github.com/mitchellh/mapstructure"
~~~~

## Good
~~~~
"github.com/go-viper/mapstructure/v2"
~~~~
