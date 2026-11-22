---
kind: forbid
pattern: '(?<![\w.])sleep\(\d'
targets: [files]
paths: ['*Tests.swift', '*Test.swift']
severity: block
from: benchmark distractor (testing)
---
No sleep in XCTest; use expectations.

## Bad
~~~~
sleep(2)
~~~~

## Good
~~~~
await fulfillment(of: [loaded], timeout: 2)
~~~~
