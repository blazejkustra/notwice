---
kind: forbid
pattern: '^\s*import\s+OpenGLES\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (dependencies)
---
Do not import OpenGLES; use Metal.

## Bad
~~~~
import OpenGLES
~~~~

## Good
~~~~
import Metal
~~~~
