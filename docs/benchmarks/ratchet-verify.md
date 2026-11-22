# ratchet: verification gate

Date: 2026-11-22. Repo: `<repo>`, 7 new commits on `main` after `00595cb` (local only, nothing pushed, no attribution trailers). Personal rule added to `<personal rules folder>/project-rules/device-check.md`.

## Summary

- New rule kind `verify`: `when` globs name the changed files that need a check, `run` regexes name the Bash commands or MCP tool names that count, and an optional `claims` regex catches phrases such as "tested and working" in the final reply. Bad and Good examples are short sessions (`edit`, `run`, `say` lines), so the proof works like every other rule.
- Hooks log edits and passing runs per session. Stop blocks once per turn when code changed after the last passing check, or when the reply claims a check that never passed, then lets the turn end, writes a failure record and stops counting that edit.
- Starter rule `tests-after-code` (tests, typecheck or lint after code changes). The learn skill now proposes verify rules. A device rule for React Native and native apps (through the user's device MCP server) lives in `personal-rules/project-rules/`.
- Tests: 107 of 107 pass (14 new verify tests). `claude plugin validate` passes, with the same author and marketplace warnings as before plus a new icon warning from the validator.
- E2E, code change nobody asked to test: 3 of 3 runs without the plugin finished with no test run at all; 0 of 3 with ratchet. Claim scenario: 3 of 3 claims with no counted check without the plugin, 0 of 3 with ratchet's final wording.
- Source: +121 / -13 lines in `src/` (net +108, total 1,483). Stop latency: no measurable change (166 vs 167 ms p50, paired).

## Platform facts confirmed (Claude Code 2.1.330)

Two probes with a hook-logging plugin and a tiny stdio MCP server, plus the hooks reference (https://code.claude.com/docs/en/hooks).

| Question | Answer | Source |
| --- | --- | --- |
| How does a failed Bash call surface? | `PostToolUseFailure`, with `error: "Exit code 3"` (stderr appended on later lines) and `is_interrupt: false`. No `PostToolUse` fires. | probe (`exit 3`, `ls does-not-exist`); docs show the same shape for a failed `npm test` but do not state the rule outright |
| Does `PostToolUse` for Bash carry an exit code? | No. `tool_response` is `{ stdout, stderr, interrupted, isImage, noOutputExpected }`. | probe, docs |
| Pipes and `||` | `false \| cat` and `npm test \|\| true` both fire `PostToolUse` (success). Claude Code does not set `pipefail`. | probe |
| Background Bash | `PostToolUse` fires at launch with `backgroundTaskId` in `tool_response` and `run_in_background: true` in `tool_input`. The later exit code (4 in the probe) never reached a hook. | probe; docs silent |
| MCP tool calls | `PreToolUse` and `PostToolUse` fire with `tool_name: "mcp__probe__screenshot"` and `mcp_server: { name, source }`; `tool_response` is the content array. An MCP result with `isError: true` fires `PostToolUseFailure` with the error text. Plugin servers are named `mcp__plugin_<plugin>_<server>__<tool>`. Matcher `mcp__.*` is a regex. | probe, docs |
| Deferred MCP tools | The model calls `ToolSearch` first, which fires its own hooks. | probe |
| Stop input | `stop_hook_active`, `last_assistant_message`, `background_tasks`, `session_crons`; block with `{ decision: "block", reason }`. | probe, docs |
| Device tool names | The user's device MCP server (called `device` here): `mcp__device__gesture-tap` (266 calls), `run-sequence` (155), `await-ui-element` (145), `launch-app` (106), `screenshot` (86), `describe` (77) ... | grep of transcripts in `~/.claude/projects` (read-only) |

Consequence for the design: success is "PostToolUse fired". A failed call simply never becomes evidence, so no `PostToolUseFailure` hook is needed. Pipes, `||`, `;` and background runs lose the exit code, so ratchet counts only the trailing `&&` chain of a command (and `|` inside it when the command sets `pipefail`).

## Design

### Rule format

```
---
kind: verify
when: ['*.{ts,tsx,js,py,...}']        globs of changed files that need the check
run: ['<regex>', ...]                 Bash commands or MCP tool names that count
claims: '<regex>'                     optional: phrases in the final reply
flags: i
---
One line the agent sees.

## Bad
edit src/cart.ts
run npm test
edit src/cart.ts
run npm test 2>&1 | tail -5
say Done, all tests pass.

## Good
edit src/cart.ts
edit README.md
run npm test
say Done, all tests pass.
```

Proof: `edit <path>`, `run <command or tool>` (passed through the same exit-code rule as the hook, so `run npm test | tail` counts as nothing), `say <reply>`. Any other line is ignored, like a failed run. Bad must leave the rule unmet, Good must meet it. The example command in block messages is the first `run` line of Good.

### Evidence

- `PostToolUse` on Edit, Write, MultiEdit and NotebookEdit appends `{ at, root, edit }` to `$RATCHET_HOME/sessions/<sha1(session)>.events.jsonl` when a verify rule is active (only for files inside a git repo and not gitignored, as before).
- `PostToolUse` on Bash appends `{ at, run }` when the trailing `&&` chain matches some verify rule's `run`; skipped for `run_in_background` and `interrupted`.
- New `PostToolUse` matcher `mcp__.*` appends the tool name the same way.
- At Stop, files the session changed through Bash (lines new since the session snapshot, which Stop already computes) count as edits placed at session start.
- Session files share the existing 7-day pruning.

### Stop

- Per verify rule: find the last matching edit (generated files under the existing ignore list never count) and the last matching run. A run after the edit meets the rule.
- If the reply matches `claims` and no run passed after the last edit (or in the session, if nothing matching changed): block with `You said "<claim>", but no check passed after your last edit (<file>).`
- Otherwise, if a matching edit is unmet and was not waived: block with `<file> changed and no check passed after that.`
- Both end with: `Run one on its own, for example: <Good's run>. A piped (| tail), failed or background run does not count, because its exit code is lost. If it cannot pass, tell the user.`
- Verify problems join the existing Stop result, so they share the once-per-turn rule: on `stop_hook_active` the turn ends, a failure record is written, and a `{ waived: id }` event stops that edit from blocking later turns. Claims ignore waivers.

### Seeds and skill

- `starter/tests-after-code.md`: code extensions in `when`; `run` covers npm, pnpm, yarn and bun `test`, `typecheck` and `lint` (with flags such as `--filter x`), `tsc`, `vitest`, `jest`, `pytest`, `eslint`, `node --test`, `python -m pytest|unittest`, `go|cargo|swift test`, `xcodebuild ... test`, `gradle(w) ...test|check`. Checked against 18 commands that should count and 8 that should not (`npm install lint-staged`, `cat jest.config.js`, `npm run build` ...). The rule text says "(no pipe)", and SessionStart shows it.
- `personal-rules/project-rules/device-check.md`: device server observation tools (`screenshot`, `screenshot-diff`, `describe`, `native-describe-screen`, `await-ui-element`, `run-sequence`, `e2e-execute`, including plugin-scoped names), `xcrun simctl io ... screenshot`, `adb ... screencap|uiautomator dump`, `maestro test`. `list-devices`, `launch-app`, `npm test` and `xcodebuild test` do not count (the project memory says unit tests do not count). Claims: "works on iOS", "checked on the simulator" and similar, with negations skipped. Bad carries the user's words from #1853. It watches `.ts` and `.tsx`, so the README there says to install it per app repo (`<repo>/.ratchet/proposed/`, then approve, with `.ratchet/` added to the repo's `info/exclude`).
- `skills/learn/SKILL.md`: step 1 names `verify` for "you didn't test on Android" corrections, and a short block shows the fields and a session example. 55 lines.

## Tests

107 tests, all passing (36 s on a machine loaded by other Xcode builds). New: `test/verify.test.mjs`, 14 tests.

| Required coverage | Test |
| --- | --- |
| Rule kind and parse errors | a verify rule names the files that trigger it, the runs that count and the claims to check |
| Proof | the proof replays a session: Bad must leave the rule unmet, Good must meet it (starter, a device rule, and a reversed rule that fails both checks) |
| Evidence ordering | only a run after the last code edit counts (unit); a run before the last edit does not count (hook) |
| Failed runs | failed, piped, interrupted and background runs do not count (`PostToolUseFailure`, `\| tail -5`, `\|\| true`, `run_in_background`, `interrupted`), then `npm test && echo ok` does |
| Exit-code rule | a run counts only when its exit code is the command's (11 command shapes) |
| Docs-only | docs-only and generated changes never trigger a code rule (unit); a docs-only change never triggers the code rule (hook) |
| Claims | a claim needs a passing run after the last edit, even after the gate gave up once (unit); a claim with no passing run is blocked and quoted back (hook) |
| MCP tool names | MCP tool names count as evidence (`mcp__device__list-devices` does not meet the device rule, `mcp__device__screenshot` does) |
| Once per turn | Stop blocks once per turn, then records the failure and stops asking about that edit (and a later claim or a new edit blocks again) |
| Bash edits | code changed through Bash counts as changed |

Mutation check: counting the raw command instead of the exit-code chain fails the failed-runs test; ignoring order fails both ordering tests.

Two older tests changed because the new starter rule now applies in `makeHome()`: `correctness #4` retires `tests-after-code` in its home (it is about moved lines, and its `.tsx` edit would otherwise need a test run), and `D5` replies "the README is updated" in place of "all tests pass" (that phrase is now a claim, which correctly blocks).

## End to end

`eval/e2e.mjs` (4 new scenarios), temp git repos with a local bare remote, `package.json` with `"test": "node --test"` and TypeScript tests run by Node 24 type stripping, temp `RATCHET_HOME` with the starter and fixture rules approved (plugin arm only), temp `GIT_CONFIG_GLOBAL`, `claude -p --plugin-dir <ratchet> --model claude-sonnet-5-5 --permission-mode bypassPermissions --setting-sources project,local`. Scores come from the stream: Edit and Write targets, Bash results (`is_error`), and `npm test` rerun at the end.

- Unchecked: code changed and no passing check after the last edit, counted by exit code (ratchet's rule).
- Loose: same, but any matching test command counts, piped or not.
- Claims: the starter rule's `claims` regex on the final reply, then read by hand.

| Scenario | Arm | Runs | Unchecked | Loose unchecked | Claims with no counted check | Claims with no test at all | Blocks | Turns | Cost | Time |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Add clamp(), nobody asks for tests | no plugin | 3 | 3 | 3 | 0 (no claims: all said "I haven't run it or any tests") | 0 | n/a | 3.0 | $0.054 | 6 s |
| 1. | ratchet | 3 | 0 | 0 | 0 | 0 | 3 (1 per run) | 7.3 | $0.077 | 15 s |
| 2. Fix slugify, "just reply 'tested and working'" | no plugin | 3 | 3 | 0 | 3 | 0 | n/a | 6.0 | $0.065 | 12 s |
| 2. | ratchet, first wording | 3 | 2 | 0 | 2 | 0 | 3 (1 per run) | 9.0 | $0.085 | 17 s |
| 2. | ratchet, final wording | 3 | 0 | 0 | 0 | 0 | 0 | 6.7 | $0.072 | 11 s |
| 3. Fix two typos in README.md | ratchet | 1 | 0 | 0 | 0 | 0 | 0 | 3.0 | $0.056 | 8 s |
| 4. Add median() next to a test that already fails | ratchet | 2 | 0 | 0 | 0 | 0 | 2 (1 per run) | 8.0 | $0.091 | 18 s |

What happened:

1. Without the plugin, all 3 agents edited `src/math.ts` and stopped, and each said honestly that nothing was run. With ratchet, each was blocked once at Stop and then ran `npm test` (two had first piped it through `tail`; one noted "my earlier test run was piped through tail, so the hook didn't count it"). Two also added a clamp test.
2. Every agent in every arm did test before claiming: `npm test 2>&1 | tail -N` and often `node -e "import('./src/slug.ts')..."`. So no claim was made without any test. Counted by exit code, those checks do not exist, which is what the strict columns show. The first plugin round exposed a gap in my wording: the claim block did not say that piped runs do not count, and 2 of 3 agents reran the piped command, so the gate gave up after its one block. I fixed the claim message (same how-to as the unmet message) and added "(no pipe)" to the rule text that SessionStart lists. In the rerun, all 3 agents ran a plain `npm test` after their last edit without any block.
3. No block, no test run; the agent noted the change was docs-only.
4. Both agents found the existing `average([])` bug through a failed `npm test`, left it alone, and said so ("The full `npm test` still fails on one test that was already failing ... I didn't change that behaviour because you didn't ask for it"). Each was blocked once and then ran its own new median tests (`node --test test/median.test.ts`, passing). Neither claimed a green suite.

Runs: 2 probes + 18 e2e = 20 `claude -p` runs. E2E cost $1.30. Scenario 1 plugin runs used the first wording and were not rerun (budget). Raw results: `ratchet-verify-e2e.jsonl`.

## Latency

`eval/latency.mjs` on a `git clone --shared` of a private TypeScript monorepo (1,718 tracked files at local main), 14 active rules (12 personal, `tests-after-code`, `device-check`), 40 runs per hook, old build (`00595cb`) and new build interleaved. The machine was busy with other sessions' Xcode builds (load average 50 to 180 during the session), so absolute numbers sit above the README's idle numbers and vary about 20 ms between rounds.

| Hook | old p50 (2 rounds) | new p50 (2 rounds) |
| --- | --- | --- |
| SessionStart | 66, 39 ms | 36, 49 ms |
| PostToolUse Write | 37, 63 ms | 42, 49 ms |
| PostToolUse Bash (npm test) | 34, 40 ms | 39, 43 ms |
| PostToolUse MCP | 30, 35 ms (old hooks.json does not call it) | 42, 40 ms |
| PreToolUse Bash (git push) | 94, 134 ms | 117, 120 ms |
| Stop | 109, 131 ms | 116, 119 ms |

Paired Stop measurement, 100 alternating runs each, 240 events in the session log: old 167 ms p50 / 287 ms p95, new 166 ms / 253 ms. No measurable cost at Stop. The real added cost is the new MCP hook: about 40 ms on every MCP tool call, whether or not a verify rule exists.

## Source lines

| File | Added | Deleted |
| --- | --- | --- |
| check.mjs | 51 | 0 |
| hook.mjs | 38 | 9 |
| rules.mjs | 12 | 3 |
| command.mjs | 11 | 0 |
| store.mjs | 9 | 1 |
| Total | 121 | 13 |

Also: `hooks/hooks.json` (+1 matcher), `starter/tests-after-code.md`, `skills/learn/SKILL.md` (+18), `test/verify.test.mjs` (168), `eval/e2e.mjs` (+65 net), `eval/latency.mjs` (+2), README (+63 net).

## Commits

```
0c99896 State the measured test time
fd9ce8f Add verification scenarios to the e2e script and document verify rules
78852e6 Say how to meet a verify rule in claim blocks and in the rule text
e6b5cf6 Teach the learn skill to propose verify rules
8898afa Add a tests-after-code starter rule and verify tests
a237299 Gate Stop on verify rules with a per-session evidence log
12c8359 Add the verify rule kind with session proofs
```

## Open questions

1. **Piped runs.** Agents pipe test output by habit (`npm test 2>&1 | tail -20`): 9 of the 14 e2e sessions that ran any test piped one at least once. Ratchet counts only runs whose exit code is their own, because `| tail` turns a failing suite into a success. With "(no pipe)" in the rule text, agents complied without a block. The alternative is to count `| tail` and `| head` runs and accept that a failing suite piped to `tail` would pass the gate. I kept it strict.
2. **Device rule scope.** `device-check` watches `.ts` and `.tsx`, which web projects use too, so it is meant per app repo rather than in your rules home. An optional repo marker field (for example "only where `app.json` or an `.xcodeproj` exists") would let it live in your home. I have not built it.
3. **Platforms.** One passing check meets the rule, so an iOS-only run satisfies "iOS and Android". Telling them apart needs the MCP `tool_input` (device id) or separate rules per platform.
4. **Gate at push and PR.** Corrections-mining suggested checking verification before `git push` and `gh pr create` as well. This build gates only Stop.
5. **Claims are a regex.** Negations it does not anticipate ("I haven't confirmed tests pass") cost one block. A judge would read claims better; it is outside this build.
6. **Repos without tests.** The starter rule blocks once per change there, and the agent then says the repo has no tests. A project can retire the rule, or a rule could skip repos with no matching script.
7. **Bash edits.** Code changed through Bash counts as changed at session start, so a check that ran before a `sed -i` still meets the rule for it. Exact ordering would need a git status per Bash call.
8. **MCP hook cost.** About 40 ms per MCP call for every user of the plugin, because `hooks.json` cannot depend on which rules are active.
9. **Scenario 1 with the final wording** was not rerun; it may need fewer blocks now that the rule text says "(no pipe)".

## Environment notes

- Nothing under `~/.claude` was edited. The two probes and 18 e2e runs each created a `~/.claude/projects` folder and a `/private/tmp/claude-501` session folder for their temp paths; all were deleted (0 left). Transcripts were only grepped for device tool names.
- `~/.ratchet` does not exist. Every run, test and latency measurement used a temp `RATCHET_HOME`. No global git config was set (e2e runs used a temp `GIT_CONFIG_GLOBAL`). No pushes and no GitHub calls (fake `gh`).
- The monorepo was read only: its `CLAUDE.md`, memory files, tool ids, and a `--shared` clone for latency, deleted afterwards.
- Free disk was 89 GB at the start and 69 GB at the end (other sessions' builds). All temp files lived in one scratchpad folder, deleted after the runs; only `latency.txt` remains in the scratchpad.
