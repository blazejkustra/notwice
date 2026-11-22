# Orchestration

Subagents do the long work so the main session stays free to talk to you. Hooks can tell the two apart: tool calls inside a subagent carry its `agent_id`, and the main session's calls carry none.

- **`in: main`.** A forbid rule with `in: main` applies only to the main session. It never applies to a subagent, a background command (`run_in_background: true`), a T3 delegated task, or a session started from another session's Bash. For commands it denies the call; for files it runs before Edit and Write on the lines the edit would add, so a denied edit never lands. Stop, push and CI checks skip these rules, since a line on disk does not say which agent wrote it.
- **Starter rule `wait-in-background`.** Denies `gh pr checks --watch` and `gh run watch` in the main session and tells the agent to wait in a background agent.
- **Rules for subagents.** A session's rule list does not reach its subagents (checked on Claude Code 2.1.330: the subagent saw no SessionStart context). So every subagent gets the list when it starts, without the `in: main` rules.
- **Review subagents as evidence.** A finished subagent counts as a run with the text `Agent(<subagent_type>): <description>`, so a verify rule can ask for one. A foreground subagent counts when it completes; a background one counts when it finishes, however late that is. Forks never count, since they share the author's context. A T3 delegated task counts as `mcp__t3-code__delegate_task(<role>): <title>` when it starts.
- **`at: pr`.** A verify rule with `at: pr` is checked before `gh pr create` instead of at the end of each turn: the PR waits until the rule is met, unless you add `notwice-allow <id>` to the PR body.
- **`max-open-prs`.** Before `gh pr create`, notwice asks `gh pr list --author @me --state open` and denies the new PR when you already have `max` open in the repo. Without `gh`, or offline, it lets the PR through.
- **Linked sessions.** At session start notwice exports `NOTWICE_SESSION=<session id>` through `CLAUDE_ENV_FILE`, so a `claude -p` started from that session's Bash knows its parent. notwice treats such a child as a worker and shows it under its parent in `notwice agents`.

The review gate ([`examples/rules/review-before-pr.md`](../examples/rules/review-before-pr.md)), the PR limit ([`examples/rules/max-open-prs.md`](../examples/rules/max-open-prs.md)) and a rule that makes the main session hand code edits to subagents ([`examples/rules/orchestrator-delegates.md`](../examples/rules/orchestrator-delegates.md), a warning at first) are opt-in. They are personal choices: copy the ones you want into `~/.notwice/proposed/`, then approve them. The review gate looks like this:

````markdown
---
kind: verify
at: pr
when: ['*.{ts,tsx,js,jsx,py,go,rs,swift,kt}']
run: ['^Agent\([^)]*\): *Review\b', '^mcp__t3-code__delegate_task\(review\)']
flags: i
---
Before gh pr create, a fresh subagent reviews the diff after your last code edit (Agent tool, description starting with "Review"). Wait for it to finish, fix only bugs in the changed lines, then open the PR.

## Bad
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
````

A `max-open-prs` example is the list of open PRs when `gh pr create` runs (`#18 #21 #25`); Bad must hold at least `max` of them.

## End to end

Runs of `eval/e2e.mjs`: temp repos, a local bare remote, a fake `gh` whose checks take 30 s, `claude -p`, Sonnet 5.5, the starter rules approved in the plugin arm. The CLAUDE.md arm ran later on the release build, with the same rules plus the scenario's opt-in rule in the repo's CLAUDE.md. Small samples: treat them as anecdotes.

| Scenario | Arm | Result | Blocks | Cost, time (mean) |
| --- | --- | --- | --- | --- |
| Fix a bug, push, then wait for CI | no plugin | 3 of 3 ran `gh pr checks --watch` in the main session | n/a | $0.066, 41 s |
| | notwice | 0 of 3: each handed the wait to a background agent and reported the result when it finished | 0 for the watch | $0.131, 49 s |
| | CLAUDE.md | 0 of 3: each handed the wait to a subagent | n/a | $0.121, 44 s |
| Implement a function and open a PR, review gate on | no plugin | 3 of 3 opened the PR with no review | n/a | $0.069, 15 s |
| | notwice | 0 of 3: each ran a review subagent after its last edit, then opened the PR | 0 from the gate | $0.124, 27 s |
| | CLAUDE.md | 0 of 3: each ran a review subagent first | n/a | $0.114, 16 s |

In both plugin arms the rule list at session start did the work: no agent tried the watch in the main session or `gh pr create` before its review, so the hooks never had to deny. The other blocks in those runs came from rules outside this test (a Claude trailer in a commit, tests after code).

A loaded CLAUDE.md ties notwice on both scenarios, at a similar cost. Runs that followed the rule, through notwice or CLAUDE.md, cost 1.7 to 2 times as much as the runs with no rules, because of the extra subagent. Raw runs: [`benchmarks/ratchet-orchestration-e2e.jsonl`](benchmarks/ratchet-orchestration-e2e.jsonl) and [`benchmarks/final-fixes/e2e-results.jsonl`](benchmarks/final-fixes/e2e-results.jsonl).
