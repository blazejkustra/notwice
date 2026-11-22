---
kind: forbid
targets: [commands]
pattern: ['\bnotwice(\.mjs)?\s+(approve|retire)\b', 'proposed/[^\s;&|]+\.md\s+[^\s;&|]*rules\b', '\b(mv|cp|rm|ln|tee|touch|chmod|truncate|install|rsync|dd|sed\s+-i\S*|perl\s+-\S*i)\b[^;&|\n]*(\.notwice|NOTWICE_HOME\}?)/rules\b', '>\s*["'']?\S*(\.notwice|NOTWICE_HOME\}?)/rules\b']
severity: block
from: notwice built-in
---
Only the user approves, retires or changes active rules. Ask the user to run it: with ! in front in Claude Code, or in a terminal.

## Bad
```
notwice approve no-em-dash
```

## Good
```
notwice propose no-em-dash "Agent used em dashes in UI copy"
```
