---
kind: verify
at: pr
when: ['*.{ts,tsx,js,jsx,mjs,cjs,vue,svelte,py,go,rs,swift,kt,kts,java,rb,php,cs,dart,c,cc,cpp,h,m,mm}']
run: ['^Agent\([^)]*\): *Review\b', '^Agent\([^)]*review[^)]*\):', '^mcp__t3-code__delegate_task\(review\)']
flags: i
severity: block
from: notwice example
---
Before gh pr create, a fresh subagent reviews the diff after your last code edit (Agent tool, description starting with "Review"). Wait for it to finish, fix only bugs in the changed lines, then open the PR.

## Bad
The review ran, then the code changed again:
```
edit src/cart.ts
run Agent(general-purpose): Review cart diff
edit src/cart.ts
```

## Good
```
edit src/cart.ts
run Agent(general-purpose): Review cart diff
```
