---
kind: forbid
pattern: '\bConsole\.Write(?:Line)?\('
targets: [files]
paths: ['src/**/*.cs']
severity: block
from: benchmark distractor (language)
---
Use ILogger instead of Console.WriteLine in library code.

## Bad
~~~~
Console.WriteLine($"Loaded {count}");
~~~~

## Good
~~~~
_logger.LogInformation("Loaded {Count}", count);
~~~~
