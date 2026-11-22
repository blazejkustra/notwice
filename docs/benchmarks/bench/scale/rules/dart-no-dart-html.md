---
kind: forbid
pattern: '^\s*import\s+[''"]dart:html[/''"]'
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (dependencies)
---
Do not import dart:html; use package:web.

## Bad
~~~~
import 'dart:html';
~~~~

## Good
~~~~
import 'package:web/web.dart';
~~~~
