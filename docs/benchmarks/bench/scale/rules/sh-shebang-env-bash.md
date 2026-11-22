---
kind: forbid
pattern: '^#!/bin/bash\b'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Use #!/usr/bin/env bash as the shebang.

## Bad
~~~~
#!/bin/bash
~~~~

## Good
~~~~
#!/usr/bin/env bash
~~~~
