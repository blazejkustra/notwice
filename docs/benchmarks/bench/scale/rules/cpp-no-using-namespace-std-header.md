---
kind: forbid
pattern: '^\s*using\s+namespace\s+std\s*;'
targets: [files]
paths: ['*.{h,hpp,hh,hxx}']
severity: block
from: benchmark distractor (naming)
---
Never write using namespace std; in headers.

## Bad
~~~~
using namespace std;
~~~~

## Good
~~~~
using std::string;
~~~~
