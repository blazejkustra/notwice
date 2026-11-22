---
kind: forbid
pattern: 'catch\s*(?:\([^)]*\))?\s*\{\s*\}'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Never swallow exceptions with an empty catch.

## Bad
~~~~
catch (Exception) { }
~~~~

## Good
~~~~
catch (IOException ex) { _logger.LogWarning(ex, "Retrying"); }
~~~~
