---
kind: forbid
pattern: '^\s*import\s+AssetsLibrary\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (dependencies)
---
AssetsLibrary is banned in this codebase. Use Photos instead.

## Bad
~~~~
import AssetsLibrary
~~~~

## Good
~~~~
import Photos
~~~~
