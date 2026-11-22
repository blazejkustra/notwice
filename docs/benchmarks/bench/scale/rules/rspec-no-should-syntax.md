---
kind: forbid
pattern: '\.should(?:_not)?\s'
targets: [files]
paths: ['*_spec.rb', 'spec/**/*.rb']
severity: block
from: benchmark distractor (testing)
---
Use expect syntax, not should.

## Bad
~~~~
user.name.should eq "Ada"
~~~~

## Good
~~~~
expect(user.name).to eq "Ada"
~~~~
