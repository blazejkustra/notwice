---
kind: forbid
pattern: 'client-key-data:\s*[A-Za-z0-9+/=]{40,}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No kubeconfig client key in code, commits, PRs or comments; load it from the environment (KUBECONFIG).

## Bad
~~~~
client-key-data: LeOzZl0WVogAW75xUoskFbqrhRbeD7Zico2knXX1BYxwkKe10xVwoKrtIrfW0IJ6
~~~~

## Good
~~~~
KUBECONFIG=${KUBECONFIG}
~~~~
