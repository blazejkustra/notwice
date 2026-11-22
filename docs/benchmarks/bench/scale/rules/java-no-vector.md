---
kind: forbid
pattern: '\b(?:Vector|Hashtable|Stack)<'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Use ArrayList, HashMap or ArrayDeque instead of the legacy collections.

## Bad
~~~~
Vector<String> names = new Vector<>();
~~~~

## Good
~~~~
List<String> names = new ArrayList<>();
~~~~
