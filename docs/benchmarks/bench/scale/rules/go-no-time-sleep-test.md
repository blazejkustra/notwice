---
kind: forbid
pattern: '\btime\.Sleep\('
targets: [files]
paths: ['*_test.go']
severity: block
from: benchmark distractor (language)
---
No time.Sleep in tests; wait on a channel or use a fake clock.

## Bad
~~~~
time.Sleep(100 * time.Millisecond)
~~~~

## Good
~~~~
select { case <-done: case <-time.After(time.Second): t.Fatal("timeout") }
~~~~
