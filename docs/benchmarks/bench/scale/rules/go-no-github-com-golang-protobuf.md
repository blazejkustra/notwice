---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/golang\/protobuf(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Replace github.com/golang/protobuf with google.golang.org/protobuf.

## Bad
~~~~
import "github.com/golang/protobuf"
~~~~

## Good
~~~~
"google.golang.org/protobuf/proto"
~~~~
