---
kind: forbid
pattern: '\bon(?:click|load|submit|change|mouseover)="'
targets: [files]
paths: ['*.{html,htm}']
severity: block
from: benchmark distractor (language)
---
No inline event handler attributes.

## Bad
~~~~
<button onclick="save()">Save</button>
~~~~

## Good
~~~~
<button data-action="save">Save</button>
~~~~
