---
kind: forbid
pattern: '\b(?:e?println|e?print)!\('
targets: [files]
paths: ['src/**/*.rs']
severity: block
from: benchmark distractor (language)
---
No println! in library code; use tracing.

## Bad
~~~~
println!("loaded {} rows", n);
~~~~

## Good
~~~~
tracing::info!(rows = n, "loaded");
~~~~
