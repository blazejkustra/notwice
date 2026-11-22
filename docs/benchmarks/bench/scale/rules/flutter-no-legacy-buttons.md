---
kind: forbid
pattern: '\b(?:FlatButton|RaisedButton|OutlineButton)\('
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (language)
---
Use TextButton, ElevatedButton or OutlinedButton.

## Bad
~~~~
RaisedButton(onPressed: save, child: Text("Save"))
~~~~

## Good
~~~~
ElevatedButton(onPressed: save, child: Text("Save"))
~~~~
