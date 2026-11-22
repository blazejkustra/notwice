---
kind: forbid
pattern: 'func\s+Benchmark\w+\(b \*testing\.B\)\s*\{\s*assert\.'
targets: [files]
paths: ['*_test.go']
severity: block
from: benchmark distractor (language)
---
Do not assert inside benchmark loops.

## Bad
~~~~
func BenchmarkParse(b *testing.B) { assert.NoError(b, err)
~~~~

## Good
~~~~
func BenchmarkParse(b *testing.B) { for b.Loop() { parse(input) } }
~~~~
