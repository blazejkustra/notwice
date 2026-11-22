---
kind: forbid
pattern: '^\s*import\s+GLKit\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (dependencies)
---
Replace GLKit with MetalKit.

## Bad
~~~~
import GLKit
~~~~

## Good
~~~~
import MetalKit
~~~~
