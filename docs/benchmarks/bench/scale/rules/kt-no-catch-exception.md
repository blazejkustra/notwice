---
kind: forbid
pattern: 'catch\s*\(\s*\w+\s*:\s*(?:Exception|Throwable)\s*\)'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (language)
---
Catch specific exceptions; rethrow CancellationException.

## Bad
~~~~
catch (e: Exception) {
~~~~

## Good
~~~~
catch (e: IOException) {
~~~~
