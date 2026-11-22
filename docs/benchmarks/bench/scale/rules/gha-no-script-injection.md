---
kind: forbid
pattern: 'run:.*\$\{\{\s*github\.event\.(?:pull_request|issue|comment|review|head_commit)\.(?:title|body|head\.ref|message)'
targets: [files]
paths: ['.github/workflows/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Never interpolate event text into run: scripts; pass it through env.

## Bad
~~~~
        run: echo "${{ github.event.pull_request.title }}"
~~~~

## Good
~~~~
        run: echo "$PR_TITLE"
~~~~
