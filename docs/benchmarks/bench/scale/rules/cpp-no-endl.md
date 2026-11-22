---
kind: forbid
pattern: 'std::endl\b'
targets: [files]
paths: ['*.{cc,cpp,cxx,hpp,hh,hxx}']
severity: warn
from: benchmark distractor (language)
---
Write '\n' instead of std::endl unless you need a flush.

## Bad
~~~~
std::cout << value << std::endl;
~~~~

## Good
~~~~
std::cout << value << '\n';
~~~~
