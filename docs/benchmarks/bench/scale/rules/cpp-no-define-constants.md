---
kind: forbid
pattern: '^\s*#define\s+[A-Z_]+\s+\d'
targets: [files]
paths: ['*.{cc,cpp,cxx,hpp,hh,hxx}']
severity: block
from: benchmark distractor (language)
---
Use constexpr instead of #define for constants.

## Bad
~~~~
#define MAX_ITEMS 64
~~~~

## Good
~~~~
constexpr int kMaxItems = 64;
~~~~
