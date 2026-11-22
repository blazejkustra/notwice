---
kind: forbid
pattern: '\w+:\s*&Vec<'
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
Take &[T] instead of &Vec<T> in parameters.

## Bad
~~~~
fn total(items: &Vec<u32>) -> u32 {
~~~~

## Good
~~~~
fn total(items: &[u32]) -> u32 {
~~~~
