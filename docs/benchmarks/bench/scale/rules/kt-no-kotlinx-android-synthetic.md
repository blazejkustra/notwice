---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?kotlinx\.android\.synthetic\b'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace kotlinx.android.synthetic with view binding.

## Bad
~~~~
import kotlinx.android.synthetic
~~~~

## Good
~~~~
import com.example.databinding.ActivityMainBinding
~~~~
