---
kind: forbid
pattern: '^\s*cd\s+[^|&;]+$'
targets: [files]
paths: ['*.{sh,bash,zsh}']
severity: block
from: benchmark distractor (language)
---
Guard cd with || exit (ShellCheck SC2164).

## Bad
~~~~
cd "$build_dir"
~~~~

## Good
~~~~
cd "$build_dir" || exit 1
~~~~
