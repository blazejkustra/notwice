---
kind: forbid
pattern: '\.Wait\(\s*\)'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Do not block with Task.Wait(); await the task.

## Bad
~~~~
task.Wait();
~~~~

## Good
~~~~
await task;
~~~~
