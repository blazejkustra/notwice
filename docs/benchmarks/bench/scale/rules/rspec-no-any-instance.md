---
kind: forbid
pattern: '\b(?:allow|expect)_any_instance_of\('
targets: [files]
paths: ['*_spec.rb', 'spec/**/*.rb']
severity: block
from: benchmark distractor (testing)
---
Do not stub any_instance_of; inject the dependency.

## Bad
~~~~
allow_any_instance_of(Client).to receive(:get)
~~~~

## Good
~~~~
allow(client).to receive(:get)
~~~~
