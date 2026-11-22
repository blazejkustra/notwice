---
kind: forbid
pattern: '\basync\s+void\s+(?!On[A-Z])\w+\('
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
No async void except event handlers; return Task.

## Bad
~~~~
public async void Save() {
~~~~

## Good
~~~~
public async Task SaveAsync() {
~~~~
