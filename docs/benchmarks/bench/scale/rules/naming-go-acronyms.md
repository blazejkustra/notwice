---
kind: forbid
pattern: '\b(?:Http|Url|Json|Id|Api|Sql)[A-Z]\w*\b|\b\w+(?:Http|Url|Json|Id|Api)\b(?=\s*[(:=])'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (naming)
---
Go initialisms keep one case: HTTP, URL, ID, API.

## Bad
~~~~
func parseUrl(raw string) {
~~~~

## Good
~~~~
func parseURL(raw string) {
~~~~
