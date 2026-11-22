---
kind: forbid
pattern: '\bNULL\b'
targets: [files]
paths: ['*.{cc,cpp,cxx,hpp,hh,hxx}']
severity: block
from: benchmark distractor (language)
---
Use nullptr instead of NULL in C++.

## Bad
~~~~
if (node == NULL) return;
~~~~

## Good
~~~~
if (node == nullptr) return;
~~~~
