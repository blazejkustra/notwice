---
kind: forbid
pattern: 'XCTAssertTrue\(\s*true\s*\)'
targets: [files]
paths: ['*Tests.swift', '*Test.swift']
severity: block
from: benchmark distractor (testing)
---
No placeholder XCTAssertTrue(true).

## Bad
~~~~
XCTAssertTrue(true)
~~~~

## Good
~~~~
XCTAssertEqual(total, 42)
~~~~
