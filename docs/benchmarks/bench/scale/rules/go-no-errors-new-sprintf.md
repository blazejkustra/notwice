---
kind: forbid
pattern: 'errors\.New\(\s*fmt\.Sprintf\('
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
Use fmt.Errorf instead of errors.New(fmt.Sprintf()).

## Bad
~~~~
return errors.New(fmt.Sprintf("bad id %d", id))
~~~~

## Good
~~~~
return fmt.Errorf("bad id %d", id)
~~~~
