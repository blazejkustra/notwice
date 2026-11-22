---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?android\.support\.'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace android.support. with AndroidX.

## Bad
~~~~
import android.support.Legacy
~~~~

## Good
~~~~
import androidx.appcompat.app.AppCompatActivity
~~~~
