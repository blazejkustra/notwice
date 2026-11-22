---
kind: forbid
pattern: '^co-authored-by:.*\b(claude|anthropic)\b|generated with \[?claude code|^claude-session:|claude\.ai/code/session_'
flags: i
targets: [commits, pr, comments]
severity: block
from: notwice starter set
---
No Claude or Anthropic attribution in commits, PRs or comments: no Co-Authored-By Claude, no "Generated with Claude Code", no Claude-Session or claude.ai session links.

## Bad
```
fix(installer): pin the node path in global MCP entries

Editors launched outside a login shell inherit a PATH without nvm, so the
bare command failed with ENOENT.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Good
```
fix(installer): pin the node path in global MCP entries

Editors launched outside a login shell inherit a PATH without nvm, so the
bare command failed with ENOENT.
```
