---
kind: forbid
pattern: 'thread::sleep\('
targets: [files]
paths: ['tests/**/*.rs']
severity: block
from: benchmark distractor (testing)
---
No thread::sleep in tests; use a channel or tokio::time::pause.

## Bad
~~~~
std::thread::sleep(Duration::from_millis(50));
~~~~

## Good
~~~~
tokio::time::advance(Duration::from_millis(50)).await;
~~~~
