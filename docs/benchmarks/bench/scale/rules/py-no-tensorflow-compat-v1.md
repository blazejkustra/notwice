---
kind: forbid
pattern: '^\s*(?:import\s+tensorflow\.compat\.v1(?:\s|\.|,|$)|from\s+tensorflow\.compat\.v1(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on tensorflow.compat.v1; reach for the TensorFlow 2 API.

## Bad
~~~~
import tensorflow.compat.v1
~~~~

## Good
~~~~
import tensorflow as tf
~~~~
