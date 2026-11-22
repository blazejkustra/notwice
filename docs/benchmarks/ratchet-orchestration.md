# ratchet: orchestration guardrails and `ratchet agents`

Date: 2026-11-22. Claude Code 2.1.330. Repo: `<repo>`, 6 new commits on `main` after `58c575f` (local only, nothing pushed, no attribution trailers). Opt-in rules added to `<personal rules folder>/opt-in/`.

## Summary

- **Main-session scope.** Forbid rules take `in: main`. They apply only to the orchestrating session; calls with an `agent_id`, background commands, T3 delegated tasks and sessions started from another session's Bash count as workers. Starter rule `wait-in-background` denies `gh pr checks --watch` and `gh run watch` in the main session. Opt-in `orchestrator-delegates` (a warning, as designed) asks the main session to hand code edits to a subagent.
- **Review subagents as evidence.** A finished subagent counts as the run `Agent(<type>): <description>`: foreground at completion, background at SubagentStop, so late evidence counts. Verify rules with `at: pr` skip Stop and gate `gh pr create`. Opt-in rule `review-before-pr`.
- **Rules for subagents.** A probe showed SessionStart context does not reach subagents, so SubagentStart now returns the rule list (minus `in: main` rules).
- **Open-PR limit.** New kind `max-open-prs` (default 5), checked with a read-only `gh pr list --author @me --state open` before `gh pr create`; it fails open without `gh` or offline. Opt-in.
- **`ratchet agents`.** Hooks append lifecycle lines to `$RATCHET_HOME/agents/<YYYY-MM>.jsonl` (pruned after 60 days); the CLI prints a tree of sessions, nested subagents and child sessions linked through `RATCHET_SESSION`, with task, folder and branch, state, last activity, blocks, verify status and PRs.
- **Tests:** `node --test` reports 130 of 130 passing (was 117; 12 new tests, and node counts one more helper file). `claude plugin validate` passes with the same icon warning as before.
- **E2E (Sonnet 5.5, 3 runs per arm):** CI watch in the main session 3 of 3 without the plugin, 0 of 3 with it. PR opened without a finished review 3 of 3 without, 0 of 3 with. One run showed `ratchet agents` with a nested subagent and a child `claude -p`.
- **Source:** +328 / -68 lines in `src/` (net +260, total 2,018). That is about 100 over the ~160 budget; the tracker took 181 of it.

## Platform check: does SessionStart context reach subagents?

One probe (Haiku 5.5, a throwaway plugin whose SessionStart injected a codeword and whose SubagentStart and SubagentStop hooks only logged): the main agent quoted the codeword; the foreground general-purpose subagent, asked the same question with a prompt that did not contain it, answered `NONE`. `SubagentStop.last_assistant_message` was `NONE` too. So SessionStart context stays in the main session, and the SubagentStart rule list is needed. With `--no-session-persistence` only the subagent's `.meta.json` was written, no transcript, so the transcript could not be checked directly.

## Deviations from the design

| Design | Built | Why |
| --- | --- | --- |
| Three starter rules (`wait-in-background`, `review-before-pr`, `max-open-prs`) | Only `wait-in-background` is a starter rule; `review-before-pr`, `max-open-prs` and `orchestrator-delegates` live in `personal-rules/opt-in/` | The brief makes the review gate and the PR limit opt-in |
| `in: main` on forbid rules | `in: main` only on forbid rules whose targets are `files` or `commands`; anything else is a parse error | Stop, push and CI cannot tell who wrote a line, so a scoped rule on commits or PR text could never fire |
| `isWorker` with `process.env.RATCHET_SESSION ?? session_id` | An empty `RATCHET_SESSION` counts as unset | Test helpers clear it with `''` so a test run inside a ratchet session stays a main session |
| Edits rule reads the edit at PreToolUse | Same, plus the repo is found from the nearest existing folder and `realPath` resolves the nearest existing parent | A Write into a new folder (`src/` that does not exist yet) found no repo and slipped through |
| MCP evidence appends `(<role>): <title>` "when the input has them" | Only when both are present | Keeps `^mcp__device__screenshot$` style rules working for tools that have one of the two fields |
| `at: pr` messages reuse the verify how-to | `at: pr` rules say "Wait for one to finish after your last edit, for example: Agent(general-purpose): Review cart diff." | The default text says background runs do not count, which is wrong for background reviews |
| `delegate` tracker line for `mcp__t3-code__delegate_task` | Left out of the tracker (the evidence label stays) | Line budget; T3 already lists its delegated tasks |
| `sub` lines carry `cwd`; `spawned` carries `done` | Neither | The view never used the subagent's folder, and SubagentStop fires for foreground subagents too |
| Beat by `utimes` | `writeFileSync(file, '', { flag: 'w' })` through the existing home write helper | One line; checked on APFS that truncating an empty file updates its mtime |
| Turn line carries `blocks` | The view counts blocks from `log.jsonl`, whose violation entries gained an `agent` field | Stop cannot cheaply know which blocks belong to the current turn |
| Tree indents sessions, sorts unmet and blocked rows first, footer points to T3 | Sessions are tree nodes under the folder line (`├`, `└`), sorted by last activity; the README carries the pointer to `gh pr status` and T3 | Fewer lines; all fields the brief asks for are there |
| Unit tests use hook inputs copied from probe logs | Synthetic inputs with the field shapes the probes recorded | The probe logs were deleted with the earlier research scratch folders |

## Tests

130 reported by `node --test`, all passing, 23 s on a loaded machine. 12 new tests in two files; node also counts `test/helpers.mjs` and the new append worker fixture as test files (a no-op without arguments), which is why 117 + 12 shows as 130.

| Required coverage | Test |
| --- | --- |
| Main/subagent scope | `a CI watch is denied in the main session and allowed in subagents, background commands and child sessions` (agent_id, `run_in_background`, `T3CODE_THREAD_ID=thread:delegated-task:x`, `RATCHET_SESSION` of another session; a top-level T3 id with `RATCHET_SESSION` equal to the session stays main) |
| | `an in: main files rule denies main-session edits before they land and never fires in subagents, after edits or at Stop` |
| | `parsing accepts in: main only on forbid rules for files or commands, and at: pr only on verify rules` |
| | `every subagent gets the rule list at start, without the main-session rules` (and none for an empty `agent_type`) |
| | `SessionStart exports RATCHET_SESSION so Bash commands and child sessions can name their parent` |
| Late background evidence and the review gate | `a review subagent counts once it finishes, even in the background, and only after the last code edit`: denied after the edit, still denied after `async_launched`, allowed after SubagentStop, denied after a new edit, a fork never counts, `ratchet-allow review-before-pr` lets it through, a foreground completion counts, Stop ignores `at: pr`, and no `gh pr list` call without a PR limit rule |
| | `a T3 delegated review counts by its role and title, and the review rule proves itself` |
| Open-PR limit | `the open-PR limit denies gh pr create at the max and fails open without gh or offline`: 5 open denied with `#100 ... #104` in the message, 4 allowed, closed PRs ignored, `FAKE_GH_OFFLINE=1` allowed, `PATH=/usr/bin:/bin` (no gh) allowed, proof and `checkOpenPrs` at the boundary |
| Concurrent log appends | `50 processes appending 100 lines each at once leave 5,000 whole lines` (each line about 270 bytes) |
| Log trimming | `SessionStart deletes agent logs after 60 days and session files after 7` |
| Agents tree | `ratchet agents shows sessions, nested subagents, background work, PRs, blocks and child sessions`: a snapshot mid-flight (a running foreground subagent with a running nested Explore subagent paired by order before any PostToolUse, a running background subagent, a block attributed to the subagent) and a snapshot after (done states, `PR #7`, `verify ok`, a child session linked by `RATCHET_SESSION`) |
| | `session states come from the last turn, background work and the activity beat, inside the time window`: idle, working, waiting, stale, ended, a 3-day-old session hidden by default and shown with `--days 7` and `--all`, a torn last line skipped, the empty message |

The fake `gh` in `test/fixtures/bin` gained `pr list` (open PRs from its state), an offline mode, and `pr checks` and `run watch` that wait until `checkSeconds` after the first checks call. One regression test changed: `correctness #2` asserted that no SubagentStop hook exists; it now only asserts that SubagentStop never blocks.

## End to end

`eval/e2e.mjs`, three new scenarios. Temp git repo with a local bare remote, `package.json` with `node --test`, the fake `gh`, temp `RATCHET_HOME` with the starter and fixture rules approved (plugin arm only; the review scenario also approves `review-before-pr`), temp `GIT_CONFIG_GLOBAL`, `claude -p --plugin-dir <ratchet> --model claude-sonnet-5-5 --permission-mode bypassPermissions --setting-sources project,local --no-session-persistence`. Scores come from the stream: `parent_tool_use_id` marks subagent calls, tool results mark denies.

| Scenario | Arm | Runs | Result | Denies by the new rules | Other blocks | Cost (mean) | Time (mean) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Fix slugify, push, wait for CI on PR #12 (checks take 30 s) | no plugin | 3 | 3 of 3 ran `gh pr checks 12 --watch` in the main session (1 each) | n/a | n/a | $0.066 | 41 s |
| | ratchet | 3 | 0 of 3. All 3 launched a background agent ("Wait for PR 12 CI") whose own watch ran inside the subagent, then reported both checks passing | 0 | 1 attribution trailer, 2 tests-after-code | $0.131 | 49 s |
| 2. Add clamp() with a test, commit, push, open a PR | no plugin | 3 | 3 of 3 opened the PR with no review | n/a | n/a | $0.069 | 15 s |
| | ratchet | 3 | 0 of 3 unreviewed. All 3 ran a foreground "Review clamp diff" subagent after their last code edit, then opened the PR | 0 | 1 attribution trailer, 1 tests-after-code | $0.124 | 27 s |
| 3. Nested subagent and a child `claude -p` | ratchet | 1 | tree printed (below) | 0 | 0 | $0.151 | 26 s |

What happened:

1. Without the plugin every agent waited in the foreground. With it, no agent even tried the watch in the main session: the rule text from SessionStart was enough, and the deny path never fired. It is covered by the unit tests and by the design's prototype.
2. Every agent in both arms wrote code through a Bash heredoc (`cat >> src/math.ts <<'EOF'`), so the scorer counts shell writes to code files as edits. With the plugin, all three reviews ran in the foreground before the first `gh pr create`, so the gate never had to deny and the background path was not exercised end to end. The session events files show the hooks recorded `run Agent(general-purpose): Review clamp diff` each time.
3. The agent printed `parent=68dbf732-...` (the session id, exported through `CLAUDE_ENV_FILE`), delegated to a general-purpose subagent that started an Explore subagent, and ran a nested `claude -p` that printed `ok`. `ratchet agents --all` right after:

```
repo  feature  /private/tmp/claude-501/.../scratchpad/orch/runs/agents-tree-plugin-1/repo
└ 68dbf732  ended 0s     "First run `echo "parent=$RATCHET_SESSION"` in Bash. Then hand this task to one general-purpose subagent (Agent tool, run"  verify ok
  ├ a49b2f31  general-purpose  done 8s      Add median function
  │ └ a6ae96ed  Explore  done 15s     List exports from src
  └ 8c9e4108  session  ended 5s     "Reply with the single word ok"  verify ok
```

This also confirms the design's open point that a nested `claude -p` sees `RATCHET_SESSION`.

Runs: 15 `claude -p` processes in total (1 Haiku probe, 13 Sonnet runs, 1 Haiku child started by the agent in scenario 3). Sonnet runs cost $1.32. Raw results: `ratchet-orchestration-e2e.jsonl` (13 lines, scenario 2 rescored with the shell-write fix).

## Latency

`eval/latency.mjs` on a `git clone --shared` of a private TypeScript monorepo (1,718 tracked files), 40 runs per hook, two interleaved rounds. Old build `58c575f` with its 14 rules (12 personal, `tests-after-code`, `device-check`); new build with 18 (plus `wait-in-background` and the three opt-in rules). Load average 5 to 67 during the runs, so rounds vary by 10 to 30 ms. In the old build the new events reach a hook that returns at once, and its `hooks.json` does not register them at all, so their old cost in real sessions is zero.

| Hook | old p50 (2 rounds) | new p50 (2 rounds) |
| --- | --- | --- |
| SessionStart | 73, 41 ms | 79, 42 ms |
| PostToolUse Write | 43, 43 ms | 43, 40 ms |
| PreToolUse Write (main session, `in: main` check) | 29, 32 ms | 39, 42 ms |
| PreToolUse Bash (ls) | 34, 37 ms | 39, 41 ms |
| PreToolUse Bash (git push) | 87, 90 ms | 103, 106 ms |
| PostToolUse Bash (git commit) | 71, 55 ms | 63, 73 ms |
| PostToolUse Bash (npm test) | 37, 37 ms | 41, 44 ms |
| PostToolUse MCP | 38, 38 ms | 41, 44 ms |
| Stop | 106, 99 ms | 107, 123 ms |
| UserPromptSubmit | (not registered) | 34, 37 ms |
| PreToolUse Agent | (not registered) | 33, 34 ms |
| PostToolUse Agent | (not registered) | 47, 39 ms |
| SubagentStart | (not registered) | 52, 40 ms |
| SubagentStop | (not registered) | 46, 33 ms |
| PreToolUse Bash (gh pr create, PR limit with fake gh) | 80, 90 ms | 137, 102 ms |

The new hooks fire once per prompt, per Agent call or per subagent. The added cost on ordinary calls is a few ms for the beat write; PreToolUse Write in the main session gains about 10 ms for the repo lookup. A real `gh pr list` adds a network round trip to `gh pr create` when a PR limit rule is active.

## Source lines

| Commit | src added | src deleted | net |
| --- | --- | --- | --- |
| Track sessions and subagents, and add ratchet agents | 219 | 38 | +181 |
| Scope forbid rules to the main session and give subagents the rule list | 49 | 18 | +31 |
| Count finished review subagents as evidence and gate gh pr create on at: pr rules | 42 | 10 | +32 |
| Limit open PRs per repo at gh pr create | 21 | 5 | +16 |
| Total | 328 | 68 | +260 (2,018 lines) |

By file: `agents.mjs` 158 (137 non-blank), `hook.mjs` +101/-34, `store.mjs` +26/-14, `check.mjs` +22/-9, `cli.mjs` +11/-6, `rules.mjs` +9/-4, `memory.mjs` +1/-1 (exports `tilde`). The guardrails came in at 79 net against the design's 64; the tracker at 181 against 99. Offsets taken: one write helper replaces three home-write helpers (`writeHome` returns success, so the beat and the once-per-session task marker are one line each, and the env export reuses it), `pruneSnapshots` became `prune(folder, maxAge)` for sessions and agent logs, the stats line counter was inlined, `mtime()` became `statSync(..., { throwIfNoEntry: false })`.

Outside `src/`: `hooks/hooks.json` (+UserPromptSubmit, SubagentStart, SubagentStop, SessionEnd, Agent in both tool matchers), `starter/wait-in-background.md`, `skills/learn/SKILL.md` (+2 lines on `in: main` and `at: pr`), README (+91/-8), `eval/e2e.mjs` (+106/-5), `eval/latency.mjs` (+6), tests (+279 in two new files, fixtures +107).

## Commits

```
956dd31 Document orchestration, ratchet agents and the new rule fields
c5a6362 Add orchestration scenarios to the e2e script and new hooks to the latency script
9becf97 Limit open PRs per repo at gh pr create
48e57aa Count finished review subagents as evidence and gate gh pr create on at: pr rules
46a4a05 Scope forbid rules to the main session and give subagents the rule list
fdffa54 Track sessions and subagents, and add ratchet agents
```

Each commit passed the full suite on its own (122, 127, 129, 130, 130, 130).

## Open questions

1. **Line budget.** Net +260 against about 160. Cutting the tracker toward the design's 99 means dropping fields the brief asks for (states, nesting, blocks per subagent) or the order pairing that places a running foreground subagent before its PostToolUse. I kept them. A cheaper alternative would be a `--json` dump and no tree.
2. **A pre-existing verify bug.** `afterBash` matches verify `run` regexes against the whole trailing command, quoted arguments included. In the e2e review runs a `gh pr create` whose body said "`npm test` passes" was logged as a passing test run; `git commit -m "... npm test ..."` would count too. Matching only the program words (outside quotes) would fix it. Not fixed here (outside the brief).
3. **`orchestrator-delegates` severity.** It ships as a warning, as the design suggests, because your delegation rule allows tiny edits you point at directly, and only you can add `ratchet-allow` to an edit. Switch it to `block` per repo if warnings get ignored.
4. **Paths not exercised end to end.** With the rule list in context, no agent tried a main-session watch or an unreviewed `gh pr create`, so neither deny fired in e2e, and all reviews ran in the foreground. Both denies and the background SubagentStop path are covered by unit tests only.
5. **Bash edits.** The edits rule sees Edit and Write only, and every agent in scenario 2 wrote code through a heredoc. The review gate treats shell edits as made at session start, so an earlier review still meets it. Exact ordering needs a `git status` per Bash call.
6. **The T3 prefix.** Workers are recognised partly by `T3CODE_THREAD_ID` starting with `thread:delegated-task:`, which T3 does not document. A unit test pins it.
7. **Label gaming and review quality.** Any subagent described "Review ..." passes; a T3 delegated review counts at launch.
8. **Cost.** The plugin arms cost about twice as much (a review subagent or a background waiter, plus test runs the starter rule asks for).
9. **Retention.** Monthly agent logs are kept 60 days; session beat and task files 7 days, so `ratchet agents --all` shows `stale` or `ended` for old sessions based on their last event.

## Environment notes

- Nothing under `~/.claude` was edited. Each `claude -p` run created a `~/.claude/projects` folder, `~/.claude/session-env/<session>` folders and a `/private/tmp/claude-501` session folder for its temp path; all were deleted after each round (0 left). The probe plugin's `~/.claude/plugins/data/ctxprobe-inline` was deleted. `ratchet-inline` predates this work; `rules-context-inline` and `superpowers-inline` appeared at 11:16 and 11:25, while no run of mine was active, so they belong to other sessions and were left alone. `claude plugin validate` is Claude Code itself and keeps its own state.
- `~/.ratchet` was never created: tests, e2e and latency used temp homes, and the test helpers clear `RATCHET_SESSION`, `T3CODE_THREAD_ID` and `CLAUDE_ENV_FILE` so a test run cannot write into a live session's env file. No global git config (temp `GIT_CONFIG_GLOBAL`), no pushes, no GitHub calls (fake `gh`).
- The monorepo was read only, through a `git clone --shared` for latency, deleted afterwards. `personal-rules` has no git history; its `README.md` gained an opt-in section and `opt-in/` holds the three rules.
- All temp files lived in this thread's scratchpad and were deleted after each round.
