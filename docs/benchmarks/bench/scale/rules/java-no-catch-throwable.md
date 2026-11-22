---
kind: forbid
pattern: 'catch\s*\(\s*Throwable\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Never catch Throwable.

## Bad
~~~~
catch (Throwable t) {
~~~~

## Good
~~~~
catch (IOException e) {
~~~~
