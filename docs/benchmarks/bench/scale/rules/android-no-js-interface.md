---
kind: forbid
pattern: '\.addJavascriptInterface\('
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (framework)
---
Do not expose objects to WebView JavaScript.

## Bad
~~~~
webView.addJavascriptInterface(bridge, "app")
~~~~

## Good
~~~~
webView.webViewClient = SafeClient()
~~~~
