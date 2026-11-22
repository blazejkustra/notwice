---
kind: forbid
pattern: '\bUIWebView\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
UIWebView is rejected by App Review; use WKWebView.

## Bad
~~~~
let web = UIWebView()
~~~~

## Good
~~~~
let web = WKWebView()
~~~~
