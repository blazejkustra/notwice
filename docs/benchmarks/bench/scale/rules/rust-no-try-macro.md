---
kind: forbid
pattern: '\btry!\('
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
Use the ? operator instead of try!().

## Bad
~~~~
let file = try!(File::open(path));
~~~~

## Good
~~~~
let file = File::open(path)?;
~~~~
