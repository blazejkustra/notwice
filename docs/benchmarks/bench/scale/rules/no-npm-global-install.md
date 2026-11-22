---
kind: forbid
pattern: '\b(?:npm\s+(?:install|i)|pnpm\s+add|yarn\s+global\s+add)\b[^;&|\n]*\s(?:-g|--global)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not install global packages; use npx or a devDependency.

## Bad
~~~~
npm install -g typescript
~~~~

## Good
~~~~
npx tsc --version
~~~~
