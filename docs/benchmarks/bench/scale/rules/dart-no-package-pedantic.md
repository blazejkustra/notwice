---
kind: forbid
pattern: '^\s*import\s+[''"]package:pedantic[/''"]'
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (dependencies)
---
Replace package:pedantic with package:lints.

## Bad
~~~~
import 'package:pedantic/legacy.dart';
~~~~

## Good
~~~~
import 'package:lints/recommended.yaml';
~~~~
