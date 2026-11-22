---
kind: forbid
pattern: ['\b(isn''t|is not|aren''t|are not|wasn''t|was not)\b[^.!?;:()\n]{1,60},\s*(it''s|it is|they''re|they are|that''s|this is)\b', '\byou don''t\b[^.!?;:()\n]{1,60},\s*you\b']
flags: i
targets: [files, commits, pr, comments]
paths: ['*.md', '*.mdx', '*.txt']
severity: warn
from: ratchet test fixture
---
State the positive claim directly. Avoid "it's not X, it's Y" and "you don't A, you B".

## Bad
```
Ratchet isn't another prompt pack, it's a set of hooks.
```

## Good
```
Ratchet is a set of hooks that enforce your rules.
```
