---
kind: forbid
pattern: '\b(?:fit|fdescribe|fcontext)\s|focus:\s*true'
targets: [files]
paths: ['*_spec.rb', 'spec/**/*.rb']
severity: block
from: benchmark distractor (testing)
---
Do not commit focused specs.

## Bad
~~~~
fit "creates a user" do
~~~~

## Good
~~~~
it "creates a user" do
~~~~
