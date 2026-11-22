---
kind: forbid
pattern: '@ObservedObject\s+(?:private\s+)?var\s+\w+\s*='
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (framework)
---
Initialize owned models with @StateObject or @State, not @ObservedObject.

## Bad
~~~~
@ObservedObject var model = ProfileModel()
~~~~

## Good
~~~~
@StateObject private var model = ProfileModel()
~~~~
