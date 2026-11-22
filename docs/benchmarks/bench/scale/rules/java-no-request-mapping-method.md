---
kind: forbid
pattern: '@RequestMapping\([^)]*method\s*='
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Use @GetMapping, @PostMapping and friends.

## Bad
~~~~
@RequestMapping(value = "/users", method = RequestMethod.GET)
~~~~

## Good
~~~~
@GetMapping("/users")
~~~~
