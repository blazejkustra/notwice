---
kind: forbid
pattern: '\u2014'
unless: '[''"(\[/|]\s*\u2014\s*[''")\]/|]'
targets: [files, commits, pr, comments]
severity: block
from: notwice test fixture
---
Never use em dashes. Use a comma, colon, parentheses or a full stop. In code that must match existing text, write \u2014.

## Bad
```
"This post is about a dish, but the steps aren't in it — creators often keep the full recipe in a comment."
```

## Good
```
"This post is about a dish, but the steps aren't in it. Creators often keep the full recipe in a comment."
```
