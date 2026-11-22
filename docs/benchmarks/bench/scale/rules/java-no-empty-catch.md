---
kind: forbid
pattern: 'catch\s*\([^)]*\)\s*\{\s*\}'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Never swallow exceptions with an empty catch.

## Bad
~~~~
catch (IOException e) {}
~~~~

## Good
~~~~
catch (IOException e) { throw new UncheckedIOException(e); }
~~~~
