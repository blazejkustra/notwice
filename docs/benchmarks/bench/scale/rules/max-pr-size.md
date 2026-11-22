---
kind: max-added-lines
max: 300
severity: block
from: ratchet starter set
---
Keep a PR at or under 300 added lines (lockfiles, snapshots and generated files excluded). Split bigger work. Only the user may allow a bigger PR, by adding ratchet-allow max-pr-size to the PR body.

## Bad
Added and deleted lines per file, as git diff --numstat prints them:
```
412 0 src/importer.ts
96 0 src/importer.test.ts
```

## Good
A small change, plus a lockfile that does not count:
```
180 12 src/importer.ts
4000 0 package-lock.json
```
