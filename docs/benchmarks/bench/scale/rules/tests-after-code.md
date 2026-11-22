---
kind: verify
when: ['*.{ts,tsx,js,jsx,mjs,cjs,vue,svelte,py,go,rs,swift,kt,kts,java,rb,php,cs,dart,c,cc,cpp,h,m,mm}']
run: ['\b(?:npm|pnpm|yarn|bun)(?:\s+-{1,2}[\w-]+(?:[= ]\S+)?)*\s+(?:run\s+)?(?:test|typecheck|lint)\b(?!-)', '(?:^|[\s/])(?:tsc|vitest|jest|pytest|eslint)(?=\s|$)', '\bnode\s+--test\b', '\bpython3?\s+-m\s+(?:pytest|unittest)\b', '\b(?:go|cargo|swift)\s+test\b', '\bxcodebuild\b.*\s(?:test|test-without-building)\b', '\bgradlew?\b.*\s\S*(?:test|check)']
claims: '(?<!not |n''t |never )\b(?:(?:all |the )?tests? (?:all )?(?:pass|passed|passing|are passing|are green)\b|tested and working\b|(?:typecheck|tsc|lint) (?:passes|passed|is clean)\b)'
flags: i
severity: block
from: ratchet starter set
---
After code changes, run tests, typecheck or lint on their own (no pipe) before you finish. Never claim tests pass without a passing run.

## Bad
Tests ran before the last edit, and the run after it was piped, so its failure was hidden:
```
edit src/cart.ts
run npm test
edit src/cart.ts
run npm test 2>&1 | tail -5
say Done, all tests pass.
```

## Good
```
edit src/cart.ts
edit README.md
run npm test
say Done, all tests pass.
```
