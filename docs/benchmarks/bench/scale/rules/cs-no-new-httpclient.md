---
kind: forbid
pattern: '\bnew\s+HttpClient\('
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Do not new up HttpClient per call; use IHttpClientFactory.

## Bad
~~~~
using var client = new HttpClient();
~~~~

## Good
~~~~
var client = _factory.CreateClient("github");
~~~~
