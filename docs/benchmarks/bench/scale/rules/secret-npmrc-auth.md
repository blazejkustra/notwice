---
kind: forbid
pattern: '//registry\.npmjs\.org/:_authToken=(?!\$\{)[\w-]+'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a npm registry auth token in .npmrc anywhere in the repo or on GitHub; pass it through NPM_TOKEN.

## Bad
~~~~
//registry.npmjs.org/:_authToken=nGSVD6VXWgB9edn9h7D24z0zKa0VCQhYnDwJ
~~~~

## Good
~~~~
NPM_TOKEN=${NPM_TOKEN}
~~~~
