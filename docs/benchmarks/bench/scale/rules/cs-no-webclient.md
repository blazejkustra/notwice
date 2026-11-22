---
kind: forbid
pattern: '\bnew\s+WebClient\('
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
WebClient is obsolete; use an injected HttpClient.

## Bad
~~~~
var client = new WebClient();
~~~~

## Good
~~~~
var response = await _http.GetAsync(url);
~~~~
