---
kind: forbid
pattern: '\bUIAlertView\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
Use UIAlertController instead of UIAlertView.

## Bad
~~~~
UIAlertView(title: "Error", message: nil, delegate: nil, cancelButtonTitle: "OK").show()
~~~~

## Good
~~~~
present(UIAlertController(title: "Error", message: nil, preferredStyle: .alert), animated: true)
~~~~
