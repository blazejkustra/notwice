---
kind: forbid
pattern: '=\s*new\s+[A-Z]\w*\s*[({]'
targets: [files]
paths: ['*.{cc,cpp,cxx,hpp,hh,hxx}']
severity: block
from: benchmark distractor (security)
---
Use std::make_unique or std::make_shared instead of raw new.

## Bad
~~~~
auto* parser = new Parser(input);
~~~~

## Good
~~~~
auto parser = std::make_unique<Parser>(input);
~~~~
