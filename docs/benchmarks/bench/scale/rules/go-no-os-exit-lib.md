---
kind: forbid
pattern: '\bos\.Exit\(|\blog\.Fatal'
targets: [files]
paths: ['internal/**/*.go', 'pkg/**/*.go']
severity: block
from: benchmark distractor (language)
---
Only main may call os.Exit or log.Fatal.

## Bad
~~~~
log.Fatal(err)
~~~~

## Good
~~~~
return err
~~~~
