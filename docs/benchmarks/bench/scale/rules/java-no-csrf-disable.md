---
kind: forbid
pattern: 'csrf\(\)\.disable\(\)|csrf\(\s*(?:AbstractHttpConfigurer::disable|c\s*->\s*c\.disable\(\))\s*\)'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (security)
---
Do not disable CSRF protection.

## Bad
~~~~
http.csrf().disable();
~~~~

## Good
~~~~
http.csrf(Customizer.withDefaults());
~~~~
