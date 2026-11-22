---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/gorilla\/websocket(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Do not import github.com/gorilla/websocket; use github.com/coder/websocket.

## Bad
~~~~
import "github.com/gorilla/websocket"
~~~~

## Good
~~~~
"github.com/coder/websocket"
~~~~
