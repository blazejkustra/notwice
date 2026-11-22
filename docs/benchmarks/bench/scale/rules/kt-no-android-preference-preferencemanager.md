---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?android\.preference\.PreferenceManager\b'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (dependencies)
---
android.preference.PreferenceManager is banned in this codebase. Use DataStore instead.

## Bad
~~~~
import android.preference.PreferenceManager
~~~~

## Good
~~~~
import androidx.datastore.preferences.core.Preferences
~~~~
