# Known gaps

## What rules can express

- Of 223 real corrections from one user's month of sessions, the regex and structure rule kinds express 27 (12%), and verify rules bring that to 80 (36%). About 39% are design and copy taste that no check enforces. One user, one labeler.
- Rules bulk-imported from elsewhere need a check against real repos before you approve them: in a held-out scan, 17 of 40 sampled fires from the benchmark's generated 1,000-rule set were false ([final-fixes.md](benchmarks/final-fixes.md)).

## Enforcement

- The agent runs as your OS user, so the approval guard is a speed bump. It denies `notwice approve`, `notwice retire`, writes into `rules/` and common shell commands that change rule files; a determined agent could still find another way, and the next session tells you when active rules changed outside the CLI. In CI, project rules come from the PR's base commit, which is the hard layer.
- Two sessions working in the same checkout at once see each other's uncommitted changes as their own at Stop.
- PR checks depend on `gh`. Without it, PR text is checked only when it is readable in the command, and the push size gate cannot see the PR. `gh api` calls are not checked.
- Comments, reviews, merge text and issue text whose body could not be read before the command ran (variables, stdin) go unchecked. Only PR text is fetched again after the command.
- Lookaround and backreference patterns cannot use the linear regex fallback, so a pathological one can still slow a hook until its timeout.
- Git hooks never see PR text, comments or shell commands, and `git commit --no-verify` skips them.

## Verify rules

- A verify rule cannot tell which platform a check ran on, so one simulator check meets a rule that asks for iOS and Android.
- Code changed through Bash counts as changed at session start, so any passing check in the session meets the rule for it.
- `claims` is a regex: a negation it does not anticipate ("I haven't confirmed tests pass") gets one block.
- The starter rule looks for a test command in the nearest manifest only. A repo that runs its tests some other way (a Makefile, a shell script) gets no reminder from it.

## Orchestration

- `in: main` file rules see Edit and Write only: the main session can still change code through Bash (`sed -i`, heredocs). The review gate has the same gap in reverse: code changed through Bash counts as changed at session start, so an earlier review still meets the rule.
- Any subagent described as "Review ..." passes the review gate, and a T3 delegated review counts when it starts. notwice cannot judge the review itself.
- A session counts as a child only when it starts from a Bash command of a session that ran notwice's SessionStart. T3 delegated tasks are recognised by their `T3CODE_THREAD_ID` prefix, which T3 does not document.
- The open-PR limit sees PRs that `gh pr list --author @me` returns for the current repo, and stacked PRs each count.

## Agents

- Codex support was tested against a scripted fake model only (codex-cli 0.170.0), never a real Codex model run. See [codex.md](codex.md) for the differences from Claude Code.
- Hooks depend on each agent's hook API, which changes between versions. Tested on Claude Code 2.1.330 and codex-cli 0.170.0.
- `notwice memory` reads Claude Code files only.

## Evidence

- Benchmarks used 3 to 5 runs per cell, short tasks in toy repos, mostly Sonnet 5.5, and prompts that push against the rules on purpose. Long sessions and compaction are untested.
- The same team built notwice and the benchmark harness. Hook latency on the release build was measured only as CPU time on a busy machine. See [benchmarks](benchmarks/README.md).
