---
kind: forbid
pattern: '\bstd::process::exit\(|\bprocess::exit\('
targets: [files]
paths: ['src/**/*.rs']
severity: block
from: benchmark distractor (language)
---
Library code never calls process::exit.

## Bad
~~~~
std::process::exit(1);
~~~~

## Good
~~~~
return Err(Error::Config);
~~~~
