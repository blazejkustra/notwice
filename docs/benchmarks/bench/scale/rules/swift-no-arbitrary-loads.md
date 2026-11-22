---
kind: forbid
pattern: 'NSAllowsArbitraryLoads'
targets: [files]
paths: ['*.plist']
severity: block
from: benchmark distractor (security)
---
Never enable NSAllowsArbitraryLoads; add a narrow exception domain.

## Bad
~~~~
<key>NSAllowsArbitraryLoads</key>
~~~~

## Good
~~~~
<key>NSExceptionDomains</key>
~~~~
