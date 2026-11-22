---
kind: forbid
pattern: '\blazy_static!\s*\{'
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
Use std::sync::LazyLock instead of lazy_static!.

## Bad
~~~~
lazy_static! {
~~~~

## Good
~~~~
static CONFIG: LazyLock<Config> = LazyLock::new(load);
~~~~
