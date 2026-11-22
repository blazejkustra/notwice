---
kind: forbid
pattern: '^\s*import\s+[''"]dart:mirrors[/''"]'
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on dart:mirrors; reach for code generation.

## Bad
~~~~
import 'dart:mirrors';
~~~~

## Good
~~~~
import 'package:json_annotation/json_annotation.dart';
~~~~
