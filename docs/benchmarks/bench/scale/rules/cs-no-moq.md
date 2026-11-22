---
kind: forbid
pattern: '^\s*using\s+Moq\s*;'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (dependencies)
---
Moq is banned in this codebase. Use NSubstitute instead.

## Bad
~~~~
using Moq;
~~~~

## Good
~~~~
using NSubstitute;
~~~~
