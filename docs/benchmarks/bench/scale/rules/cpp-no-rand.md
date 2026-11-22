---
kind: forbid
pattern: '(?<![\w.:])rand\(\)'
targets: [files]
paths: ['*.{cc,cpp,cxx,hpp,hh,hxx}']
severity: block
from: benchmark distractor (language)
---
Use <random> instead of rand().

## Bad
~~~~
int roll = rand() % 6;
~~~~

## Good
~~~~
std::uniform_int_distribution<int> dist(1, 6);
~~~~
