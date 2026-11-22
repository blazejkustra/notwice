---
kind: forbid
pattern: '\bStringBuffer\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Use StringBuilder unless you need synchronization.

## Bad
~~~~
StringBuffer sb = new StringBuffer();
~~~~

## Good
~~~~
StringBuilder sb = new StringBuilder();
~~~~
