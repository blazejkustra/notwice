---
kind: forbid
pattern: '\w+:\s*&String\b'
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
Take &str instead of &String in parameters.

## Bad
~~~~
fn greet(name: &String) {
~~~~

## Good
~~~~
fn greet(name: &str) {
~~~~
