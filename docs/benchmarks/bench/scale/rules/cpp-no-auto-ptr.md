---
kind: forbid
pattern: '\bstd::auto_ptr<'
targets: [files]
paths: ['*.{cc,cpp,cxx,hpp,hh,hxx}']
severity: block
from: benchmark distractor (language)
---
std::auto_ptr is removed; use std::unique_ptr.

## Bad
~~~~
std::auto_ptr<Foo> foo(new Foo);
~~~~

## Good
~~~~
auto foo = std::make_unique<Foo>();
~~~~
