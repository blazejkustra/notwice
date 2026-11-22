---
kind: forbid
pattern: 'throw\s+XCTSkip\(\s*\)'
targets: [files]
paths: ['*Tests.swift', '*Test.swift']
severity: block
from: benchmark distractor (language)
---
XCTSkip needs a reason.

## Bad
~~~~
throw XCTSkip()
~~~~

## Good
~~~~
throw XCTSkip("Needs a device with Face ID")
~~~~
