---
kind: forbid
pattern: '^\s*extern\s+crate\s+\w+\s*;'
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
extern crate is not needed since edition 2018.

## Bad
~~~~
extern crate serde;
~~~~

## Good
~~~~
use serde::Deserialize;
~~~~
