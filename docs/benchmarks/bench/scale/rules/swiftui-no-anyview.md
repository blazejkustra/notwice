---
kind: forbid
pattern: '\bAnyView\('
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (framework)
---
Avoid AnyView; use @ViewBuilder or generics.

## Bad
~~~~
return AnyView(Text("Hi"))
~~~~

## Good
~~~~
@ViewBuilder var body: some View { Text("Hi") }
~~~~
