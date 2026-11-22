---
kind: forbid
pattern: '^\s*import\s+[''"]package:flutter_driver[/''"]'
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (dependencies)
---
package:flutter_driver is banned in this codebase. Use integration_test instead.

## Bad
~~~~
import 'package:flutter_driver/legacy.dart';
~~~~

## Good
~~~~
import 'package:integration_test/integration_test.dart';
~~~~
