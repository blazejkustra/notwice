---
kind: forbid
pattern: '\(\s*(?:char|int|void|unsigned char)\s*\*\s*\)\s*\w'
targets: [files]
paths: ['*.{cc,cpp,cxx,hpp,hh,hxx}']
severity: block
from: benchmark distractor (language)
---
Use static_cast or reinterpret_cast instead of C-style pointer casts.

## Bad
~~~~
auto* bytes = (char*)buffer;
~~~~

## Good
~~~~
auto* bytes = reinterpret_cast<char*>(buffer);
~~~~
