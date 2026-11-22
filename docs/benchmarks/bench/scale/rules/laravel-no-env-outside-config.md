---
kind: forbid
pattern: '(?<![\w>])env\(\s*[''"]'
targets: [files]
paths: ['app/**/*.php']
severity: block
from: benchmark distractor (framework)
---
Call env() only in config files; read config() elsewhere.

## Bad
~~~~
$key = env("STRIPE_KEY");
~~~~

## Good
~~~~
$key = config("services.stripe.key");
~~~~
