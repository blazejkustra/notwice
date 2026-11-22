---
kind: forbid
pattern: '\bpanic\('
targets: [files]
paths: ['internal/**/*.go', 'pkg/**/*.go']
severity: block
from: benchmark distractor (language)
---
Library packages return errors; they never panic.

## Bad
~~~~
panic("unreachable")
~~~~

## Good
~~~~
return fmt.Errorf("unexpected state %q", state)
~~~~
