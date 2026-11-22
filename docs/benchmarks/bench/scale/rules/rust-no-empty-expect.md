---
kind: forbid
pattern: '\.expect\(\s*""\s*\)'
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
expect() needs a message that says what was expected.

## Bad
~~~~
let port = env::var("PORT").expect("");
~~~~

## Good
~~~~
let port = env::var("PORT").expect("PORT is set by the launcher");
~~~~
