---
kind: forbid
pattern: '^\s*pod\s+[''"][\w/-]+[''"]\s*$'
targets: [files]
paths: ['Podfile']
severity: block
from: benchmark distractor (infra)
---
Pin CocoaPods dependencies to a version.

## Bad
~~~~
  pod 'Alamofire'
~~~~

## Good
~~~~
  pod 'Alamofire', '~> 5.9'
~~~~
