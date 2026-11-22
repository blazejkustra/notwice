---
kind: forbid
pattern: 'style=\{\{\s*(?:flex|width|height|backgroundColor)\b'
targets: [files]
paths: ['app/**/*.tsx', 'src/screens/**/*.tsx', 'src/components/**/*.tsx']
severity: block
from: benchmark distractor (framework)
---
React Native: use StyleSheet.create, not inline style objects.

## Bad
~~~~
<View style={{ flex: 1 }} />
~~~~

## Good
~~~~
<View style={styles.container} />
~~~~
