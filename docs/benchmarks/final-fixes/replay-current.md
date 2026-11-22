| Reproduction | Expected | Observed | Result |
| --- | --- | --- | --- |
| blocker: c++-style.md project rule, PreToolUse notwice approve no-utilize | deny/block | deny/block | pass |
| blocker: same, PreToolUse cat AuthKey_ABC.p8 | deny/block | deny/block | pass |
| blocker: personal no-c++-casts, Stop names both a.cpp lines | both | both | pass |
| blocker: git pre-commit with the same rule (exit, no stack trace) | 1 clean | 1 clean | pass |
| git cor 1: pre-push after merging main into a pushed branch | 0 | 0 | pass |
| git cor 1: pre-push --force-with-lease after rebasing on main | 0 | 0 | pass |
| git cor 5: pre-commit concluding a conflicted merge of main | 0 | 0 | pass |
| git daily 1: push a new branch cut from a teammate branch | 0 | 0 | pass |
