---
kind: forbid
pattern: '^\s*(?:export\s+)?function\s+[a-z]\w*\s*\(\s*\{[^}]*\}\s*\)\s*\{\s*$'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (naming)
---
React components are PascalCase.

## Bad
~~~~
export function userCard({ user }) {
~~~~

## Good
~~~~
export function UserCard({ user }) {
~~~~
