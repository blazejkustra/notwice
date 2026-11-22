---
kind: forbid
pattern: '\bblock_on\('
targets: [files]
paths: ['src/**/*.rs']
severity: block
from: benchmark distractor (language)
---
Do not call block_on inside async code.

## Bad
~~~~
let user = futures::executor::block_on(fetch(id));
~~~~

## Good
~~~~
let user = fetch(id).await;
~~~~
