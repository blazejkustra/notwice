---
kind: forbid
pattern: '^\s*import\s+MobileCoreServices\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (dependencies)
---
Replace MobileCoreServices with UniformTypeIdentifiers.

## Bad
~~~~
import MobileCoreServices
~~~~

## Good
~~~~
import UniformTypeIdentifiers
~~~~
