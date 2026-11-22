---
kind: forbid
pattern: 'swiftlint:disable(?::next|:this|:previous)?\s*$|swiftlint:disable\s+all\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
swiftlint:disable must name specific rules.

## Bad
~~~~
// swiftlint:disable all
~~~~

## Good
~~~~
// swiftlint:disable:next force_cast
~~~~
