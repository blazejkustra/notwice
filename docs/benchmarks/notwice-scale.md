# notwice at 1,000 rules: speed, a bounded rule list and a cut pass

Date: 2026-11-22. Repo: `<repo>`, 8 new commits on `main` after `adce17d`, local only, nothing pushed, no attribution trailers. Claude Code 2.1.330, codex-cli 0.170.0, Node 24.22, Sonnet 5.5 for the model runs. Rule sets: the benchmark's nested 12, 150 and 1,000-rule sets from `bench/scale/rules` (plus the built-in rule, so 13, 151 and 1,001 active).

## Summary

- **Speed.** Matching now skips `isIgnored` and path globs per rule and line (lines are grouped by file), skips a rule's regexes when none of the literals its patterns require appears in the line, and reads the personal rules from one `.index.json` checked against file mtimes and sizes. At 1,000 rules, matching a 300-line diff takes 2.8 ms of CPU in process (was 195 to 348 ms) and the hooks spend about half the CPU they did: edit check 110 to 70 ms, push gate 270 to 290 to 130 ms, Stop 280 to 130 ms (paired runs, p50). The prefilter gives the same matches as a plain scan on the real 1,000-rule set over 181,495 lines (7,080 violations, identical).
- **Bounded context.** SessionStart and SubagentStart now list about 3,700 characters of rules (measured: about 1,490 prompt tokens) instead of every rule. The list fills in this order: built-in and pinned rules (new `pin: true`), workflow rules, rules that fired in the last 30 days, the repo's own rules, rules whose `paths` match files in the repo, then the rest. Its last line reads "notwice enforces 962 more rules with hooks; notwice list shows them all. Every block message explains the rule it applies." The first read or edit of a file adds that file's path rules that the agent has not seen yet, up to 1,500 characters. A Claude Code probe at 1,000 rules quoted the first and last lines exactly and counted the 39 listed rules correctly.
- **E2E at 1,000 rules** (6 runs plus 3 probes, $0.43): verify 0 of 3 violations with no block at all (the rule was in the list, as with the full list at 12 rules); paste 0 of 3 violations with 2 to 3 blocks per run (its rules were outside the list, as in the hooks-only arm). First-turn prompt: 20,120 tokens, against 18,713 for hooks only, 19,656 for the shipped list and 52,747 for CLAUDE.md.
- **Cut pass.** src went 2,203 to 2,294 (step 1) to 2,365 (step 2) and back to **2,201** after 172 lines of cuts. V8 coverage across test and hook processes found only about 15 src lines that no test executes, so there was no dead code left: the cuts are shared helpers and simpler forms of the same behavior, plus the small behavior changes listed below.
- **Tests:** 147, all passing (143 before; 4 new in `test/scale.test.mjs`; 2 existing assertions updated). The Codex fake-model e2e passes 5 of 5. `claude plugin validate` passes with the same author and description warnings as before.

## Commits

```
0af625e Say in the README which unreadable texts go unchecked and what the list holds at 1,000 rules
4b45775 Cap the session rule list at about 1,500 tokens as measured
0e36b9a Let the latency script report CPU time and run chosen cases
bcb272a Read at most 128 KB of a transcript to find its cwd
1996d03 Trim helpers, the issue post-check and the transcript reader
14650e0 Share small helpers instead of repeating them
744c1a6 Cap the rule list at session start and show a file's rules on first touch
c888636 Match 1,000 rules in a few milliseconds with an index and a literal prefilter
```

The full suite passed before each commit that touched `src/` or tests: 145 (step 1), 147 (step 2), 147 (each cut commit), 147 (budget change).

## Injection design

### Session list (SessionStart, SubagentStart)

`src/core/context.mjs` ranks every active rule into tiers, sorts within a tier by recent fires or matching files (then id), and keeps the prefix whose rule lines fit in 3,400 characters:

| Tier | Rules | Why here |
| --- | --- | --- |
| 1 | built-in rules and `pin: true` | the user's choice; `human-approval` tells the agent who approves rules |
| 2 | workflow: `verify`, `require`, `max-*`, `in: main`, forbid rules on PR text only | their hooks fire late (Stop, `gh pr create`), so a block there costs a whole turn |
| 3 | fired in the last 30 days, most fires first (from `log.jsonl`) | the user's real mistakes |
| 4 | the repo's own `.notwice/rules` | written for this repo |
| 5 | `paths` that match files in the repo, most matching files first | relevant here |
| 6 | rules without `paths` | apply everywhere |
| 7 | `paths` that match nothing in the repo | least relevant |

Repo files come from `git ls-files`, grouped by file-name tail (`.ts`, `.test.ts`, `Dockerfile`) with one sample path and a count per group: the monorepo's 1,718 files make 50 groups. Testing every path rule against every file cost 100 to 200 ms of CPU on the monorepo at 1,000 rules; the samples make it negligible.

Project rules keep their own heading ("written by the repo, not by the user"). The header and the "Rules home" line stay. The footer appears only when rules are left out. SubagentStart gets the same list without `in: main` rules. Codex uses the same list, so its own 9,000-character cap is gone; 3,700 characters sits well inside the roughly 2,500 tokens of hook output Codex shows.

### First touch of a file

Claude Code PreToolUse on Read, Edit and Write, and Codex PreToolUse on `apply_patch`, add the rules whose `paths` match the file and that this agent (session id plus subagent id) has not been shown, up to 1,500 characters. Every matching id is recorded as shown, including the ones cut by the cap, so each file type is introduced once and the context cannot grow without bound. Shown ids live in the session's events file as `{ shown, by }`. Read is the useful trigger: Claude Code reads a file before editing it, so the rules arrive before the edit is written.

### Sizes

| Rules | Repo | Session list | Rules listed | Subagent list | First touch (max) | Footer |
| --- | --- | --- | --- | --- | --- | --- |
| 12 | monorepo and benchmark repo | 1,855 chars | 13 of 13 | 1,855 | 242 | none |
| 150 | monorepo | 3,705 | 39 of 151 | 3,705 | 1,467 | 112 more |
| 150 | benchmark repo | 3,718 | 38 of 151 | 3,718 | 1,467 | 113 more |
| 1,000 | monorepo | 3,687 | 38 of 1,001 | 3,687 | 1,524 | 963 more |
| 1,000 | benchmark repo | 3,715 | 39 of 1,001 | 3,715 | 1,524 | 962 more |

Before this change the list was 1,852, 13,096 and 81,554 characters; above 10,000 Claude Code shows a 2 KB preview, so at 150 and 1,000 rules the agent saw about 23 rules and lost the end of the list.

Probes (Claude Code, `--tools ""`, Sonnet 5.5, 1,000-rule home, benchmark repo):

| Probe | Context | Quoted first rule, last line, count | Prompt tokens |
| --- | --- | --- | --- |
| first cap (5,600 chars of rule lines) | 5,872 chars, 67 rules | exact, exact, 67 | 5,770 |
| final cap (3,400 chars of rule lines) | 3,720 chars, 39 rules | exact, exact, 39 | 4,902 |
| empty rules home (built-in rule only) | 375 chars | exact, exact, 1 | 3,563 |

Rule lines tokenize at about 2.5 characters per token, so the first cap cost about 2,350 tokens; the final cap adds 1,339 tokens over the empty home, about 1,490 for the whole notwice context. For comparison, the benchmark measured +994 tokens for the shipped 2 KB preview and +34,172 for the same 1,000 rules in CLAUDE.md.

Which benchmark targets make the 1,000-rule list in a fresh home: `tests-after-code`, `pr-sections` and `pr-no-extra-sections` (workflow tier); `no-em-dash`, `no-claude-attribution` and `pr-close-needs-reason` do not (no paths, never fired), so for those the hooks do the work.

## Speed

### Rule-dependent stages, in process (CPU ms, median of 25 warm calls; first call in a fresh process)

| Stage at 1,000 rules | Before | After |
| --- | --- | --- |
| Load the rules, first call | 17.7 to 18.7 | 10.9 to 11.1 |
| Load the rules, warm | 14.7 to 18.4 | 8.2 |
| Match a 50-line edit, first call (regex compile included) | 51 to 52 | 5.4 to 9 |
| Match a 50-line edit, warm | 28 to 29 | 0.6 to 0.7 |
| Match a 300-line diff, warm | 195 to 200 | 2.8 to 2.9 |
| Commit message, command | under 0.1 | under 0.1 |

At 12 rules every stage stays under 2 ms. Fresh-process `loadRules` at 1,000 rules: 24 to 29 ms before, 17 to 20 ms after (index read plus 1,000 `stat` calls; parsing every file is the alternative).

Correctness at scale, outside the test suite: on the benchmark's 1,000-rule set, 841 of 1,001 rules get literals, and `checkLines`, `checkText` and `checkCommand` over 181,495 lines (400 monorepo files plus every rule's Bad and Good example under 36 file names) return identical results with and without the prefilter (7,080 file violations, 272 commit, 102 command).

### Hooks, paired (CPU ms of the hook process tree, p50 of 15 per build, old and new alternating each iteration, two rounds)

`eval/latency.mjs` was extended with `LATENCY_CPU=1` and `LATENCY_CASES`. The load average stayed between 230 and 560 (iOS simulators in other sessions), so wall time is unusable and even CPU time drifted between back-to-back blocks; the paired script alternates builds within each iteration on a `git clone --shared` of a private 1,718-file TypeScript monorepo with origin removed, a 300-line session diff in 6 files and one commit.

| Hook | 12 rules, before | 12 rules, after | 1,000 rules, before | 1,000 rules, after |
| --- | --- | --- | --- | --- |
| SessionStart | 40 | 50 | 70 | 80 to 90 |
| Edit check (PostToolUse Write, 50-line patch) | 30 to 40 | 30 to 40 | 110 | 70 |
| Push gate (PreToolUse `git push`, 300 lines) | 70 | 60 | 270 to 290 | 130 |
| Stop (300 lines since start) | 80 to 100 | 80 to 90 | 280 | 130 |

SessionStart gains 10 to 20 ms at 1,000 rules for `git ls-files`, the log read and ranking.

`eval/latency.mjs` itself (clean tree, a fresh session per SessionStart, unpaired blocks of 10, CPU ms p50), for the record:

| Round, rules | Build | SessionStart | PostToolUse Write | PreToolUse `git push` | Stop |
| --- | --- | --- | --- | --- | --- |
| 1, 12 | before / after | 130 / 150 | 60 / 60 | 140 / 140 | 180 / 180 |
| 1, 1,000 | before / after | 210 / 150 | 120 / 90 | 210 / 190 | 240 / 210 |
| 2, 12 | before / after | 120 / 110 | 50 / 50 | 120 / 90 | 160 / 100 |
| 2, 1,000 | before / after | 110 / 120 | 70 / 70 | 110 / 150 | 120 / 140 |

The unpaired rounds move by up to 2 times between identical configurations, which is why the paired table carries the conclusion.

## End to end with Claude Code (1,000 rules)

Method: the benchmark's scenarios, oracles, fake `gh` and sandbox flags (`claude -p --model claude-sonnet-5-5 --permission-mode bypassPermissions --setting-sources project,local --no-session-persistence --strict-mcp-config`), the plugin frozen from commit `4b45775` with `--plugin-dir`, a copy of the 1,000-rule home per run, temp git repos with a bare remote under `/private/tmp/nscale.*` (outside `/private/tmp/claude-501`). "Landed" rescans the final repo, commits and successful commands with all 1,001 rules.

| Arm | Scenario | Violations | Runs with a target block | Blocks per run | Turns | Cost | Seconds | First-turn prompt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A: CLAUDE.md (benchmark) | verify | 0/3 | no hooks | | 4.7 | $0.189 | 7.7 | 52,747 |
| B: hooks only (benchmark) | verify | 0/3 | 3/3 | 1, 1, 1 | 5.0 | $0.047 | 18.3 | 18,713 |
| C: shipped list (benchmark) | verify | 0/3 | 3/3 | 1, 1, 1 | 5.7 | $0.052 | 9.7 | 19,656 |
| **D: capped list (new)** | verify | **0/3** | **0/3** | 0, 0, 0 | 5.3 | $0.053 | 8.3 | 20,120 |
| A: CLAUDE.md (benchmark) | paste | 0/3 | no hooks | | 4.7 | $0.193 | 12.7 | 52,752 |
| B: hooks only (benchmark) | paste | 0/3 | 3/3 | 2, 2, 2 | 6.0 | $0.057 | 14.7 | 18,719 |
| C: shipped list (benchmark) | paste | 0/3 | 3/3 | 2, 3, 2 | 6.3 | $0.063 | 19.7 | 19,659 |
| **D: capped list (new)** | paste | **0/3** | 3/3 | 3, 3, 2 | 6.7 | $0.066 | 14.3 | 20,146 |

Reference, the full list at 12 rules (benchmark C): verify and paste 0 blocks, 4.7 and 4.0 turns.

- **verify:** all three agents ran `npm test` on their own after the edit and no hook fired, which matches the full list at 12 rules and differs from B and C at 1,000 (a Stop block in every run). `tests-after-code` sits in the workflow tier.
- **paste:** every run was blocked on the em dash edit and on a Claude co-author trailer, then committed clean. In 2 of 3 runs the agent also ended its turn after a block (once after the edit feedback, once after the denied commit) and the Stop hook sent it back; the benchmark saw that in 1 of 6 B and C runs at 1,000. The final replies told the user the tagline was changed and that only they can allow the dash.
- Landed violations in the final state: 0 in all 6 runs. Every run finished the task.
- Cost of this round: $0.358 for the 6 runs plus $0.075 for 3 probes.

## Cut pass

### Cuts, with net line deltas

Measured per commit: `14650e0` -77, `1996d03` -87. Per-item numbers are counted from the edited code; within the first commit they sum to -78 because shared import lines moved between items.

| # | Cut | Lines |
| --- | --- | --- |
| 1 | `attempt()` replaces ten hand-written try/catch fallbacks (read text, JSON and folders, write the home, approval hash, atomic writes, prune, file sizes, real paths, the Codex transcript tail) | -34 |
| 2 | One JSON-lines appender for the log, failure records, session events and the agents log | -15 |
| 3 | Index stores parsed rules through a JSON replacer and reviver for regexes; the spec and compile split from step 1 goes | -11 |
| 4 | `groupBy` moves to `store.mjs` and also groups lines by file and repo files by name tail | -6 |
| 5 | `safely()` wraps rule regex errors for `hits` and claims | -3 |
| 6 | `scanRange()` shared by CI, pre-push and `notwice check` | -3 |
| 7 | Rule-list `fit()` as one filter | -3 |
| 8 | Snapshot read and take share one helper | -3 |
| 9 | Result logging shared by the engine and git hooks (git hooks now also log allowed markers) | 0 |
| 10 | Thirteen single-expression helpers written as one-line arrows, the codebase's existing idiom | -29 |
| 11 | `notwice memory` finds a transcript's `cwd` in its first 128 KB with one read instead of a streaming line reader (same 74-entry inventory on this machine, same 0.2 s CPU) | -12 |
| 12 | `stats` groups the log by rule instead of two hand-built tallies | -9 |
| 13 | Rule tokenizer reads a quantifier with its atom, so it needs no lookback; two literal helpers merge | -8 |
| 14 | File-touch context drops its overflow line (the session footer already says hooks enforce the rest) | -6 |
| 15 | Repo cache per command as a map lookup | -5 |
| 16 | Proposal count through `locations()` instead of its own function | -5 |
| 17 | Stop uses the shared snapshot helper (a repo entered mid-session now gets verify checks at Stop) | -4 |
| 18 | `findRule` as a find over locations | -3 |
| 19 | After a command, only PR text is fetched again; the untested issue variant of `gh ... view` goes | -2 |
| 20 | Claude session export inlined; `beforeRead` and the rules-dir deny message tightened | -4 |
| 21 | Codex's own 9,000-character context cap (the engine caps every agent) | -7 |
| 22 | `memory.mjs` reuses the shared recent-fire reader | -1 |
| 23 | `loadRules` loses its `personal` option, which no caller used | 0 |

Steps 1 and 2 added 91 and 71 lines (items 21 to 23 are inside those totals).

### Considered and rejected

- **Drop the file-touch rules** (about -15): kept, since the design recommends them, they cost about 12 lines, and with the 3,400-character cap they now carry the path rules that no longer fit at session start.
- **Drop the on-disk index and keep only the prefilter** (about -17): the brief asks for the design's index; fresh-process loading would go back to parsing 1,000 files.
- **A simpler prefilter that gives up on groups and classes:** fewer rules get literals, so less of the speedup.
- **Replace the `.approved` hash with index staleness:** the index stamp includes the parser file, so every upgrade would raise a false "rules changed outside the CLI" notice, or the index would need a version field. Not simpler.
- **Drop the size gate on `git push`, the `stats` prune list, or the issue text checks before a command:** tested behavior and requested rule kinds.
- **Read the whole Codex transcript instead of its last 2 MB** (-8): long Codex sessions reach tens of MB, read on every shell call.
- **Drop the Git 2.54 version check** (-5): install would silently do nothing on older Git.
- **Rebuild Claude's `structuredPatch` as diff text to reuse `parseDiff`:** roundabout, and `parseDiff` would need context-line handling.
- **Share event fields between the Claude and Codex adapters:** tried; it added 6 lines and was reverted.
- **One limit helper for `max-added-lines` and `max-open-prs`:** a six-parameter helper reads worse than two short functions.
- **One allow hint for agents and git hooks:** both wordings are pinned by tests and speak to different readers.
- **Collapse multi-line object literals** (the parsed rule, failure records): formatting only.

## src lines per module

| Module | Before (`adce17d`) | After |
| --- | --- | --- |
| core/engine.mjs | 375 | 341 |
| core/command.mjs | 288 | 286 |
| core/check.mjs | 189 | 196 |
| core/rules.mjs | 118 | 150 |
| core/store.mjs | 154 | 149 |
| core/agents.mjs | 146 | 140 |
| core/git.mjs | 134 | 124 |
| core/context.mjs | | 60 |
| adapters/claude.mjs | 71 | 69 |
| adapters/codex.mjs | 58 | 43 |
| adapters/git-hook.mjs | 59 | 56 |
| adapters/ci.mjs | 49 | 53 |
| adapters/patch.mjs | 27 | 27 |
| cli.mjs | 269 | 254 |
| memory.mjs | 266 | 253 |
| **total** | **2,203** | **2,201** |

Per commit: 2,203, 2,294 (step 1), 2,365 (step 2), 2,288, 2,201, 2,201, 2,201. `rules.mjs` grew by the literal extractor (about 30 lines), `context.mjs` is new; everything else shrank or held.

## Tests

147 `node --test` tests, all passing (143 before).

| New test (`test/scale.test.mjs`) | What it checks |
| --- | --- |
| 1,000 rules give the same matches through the index and prefilter as a plain scan | 1,000 generated rules over 20 regex shapes (alternation, groups, classes, lookbehind, backreferences, `\u`, `\x`, `\t`, quantifiers, case-insensitive ASCII and non-ASCII); files, commits and commands; the second load reads the index without rewriting it; every rule's Bad example fires; ignored paths stay ignored. A deliberately broken extractor makes it fail. |
| the index follows edits to a rule file | an in-place edit changes the next load |
| at 1,000 rules the session context stays capped and deterministic | under 4,000 characters, identical across sessions, tier order (built-in, pinned, workflow, recent fire), repo path rules before others, an old fire ignored, the footer count, the subagent cap |
| the first touch of a file adds its path rules | once per agent, under 1,600 characters, only rules the session list left out, separate for a subagent |

Updated assertions: the Codex context test now expects the new footer and a 4,000-character cap; the `in: main` orchestration test sends the SubagentStart that Claude Code sends before a subagent edits, so the subagent's edit still returns nothing.

Coverage: running the suite with `NODE_V8_COVERAGE` and merging per process, only about 15 src lines were never executed (the usage printout, the old-Git refusal, two tokenizer escape branches and Stop without a snapshot, which the cuts then folded).

## Behavior changes worth knowing

1. The session list is capped and ordered by tier; at 12 rules it holds the same rules in a new order.
2. Reads and edits can add a short rule list for the file's path.
3. New rule field `pin: true`.
4. `~/.notwice/rules/.index.json` caches parsed rules; it sits in the guarded rules folder.
5. Git hooks log `notwice-allow` overrides, so `stats` counts them.
6. Issue bodies that could not be read before `gh issue create/edit` are no longer fetched afterwards (PR bodies still are).
7. Stop in a repo the session entered after it started now takes a snapshot there and applies verify rules to logged edits.
8. `notwice memory` reads at most 128 KB of each folder's newest transcript.

## Open questions

1. **Cold start for big imported sets.** In a fresh home at 1,000 rules, rules without `paths` reach the list only by firing, so `no-em-dash` and `no-claude-attribution` start outside it. Counting approvals as recent activity, or pinning the starter set, would put them in; I left the ranking as the brief described.
2. **Turn ends after a block.** 2 of 3 paste runs ended the turn after a block and needed the Stop hook (the benchmark: 1 of 6). The hooks-only notice said "fix it and retry"; the new footer says every block message explains its rule. One run of A/B wording would settle whether to add "fix it and retry".
3. **File-touch value is unmeasured.** None of the e2e targets has `paths`.
4. **Forged index.** An agent that writes `.index.json` gets the same guards as writing a rule file, but the "changed outside the CLI" notice watches only the `.md` files.
5. **Recent fires have no repo preference.** `log.jsonl` has no repo field, so the design's "this repo first" ordering remains open.
6. **Repo samples.** One sample path per file-name tail can miss an exact-name glob (`AndroidManifest.xml`) whose tail group sampled another file. Such rules still arrive on first touch.
7. **Line budget.** 2,201 against 2,203; the next feature needs its own cuts.
8. **Idle wall-clock latency** is still unmeasured on this machine.

## Environment notes

- **Temp files** lived in `/private/tmp/nscale.ebeDRr` (rule homes, monorepo clone, frozen plugin, e2e repos, coverage data, scripts) and the folder is deleted.
- **Claude Code state.** The 9 `claude -p` runs created 9 `~/.claude/session-env/<id>` folders, 9 `~/.claude/projects/-private-tmp-nscale-*` folders, 9 matching `/private/tmp/claude-501` folders, one `cache-break-state` file there and an empty `~/.claude/plugins/data/notwice-inline`; all 29 are deleted. Three new entries from another live T3 session (`sessions/60711.*`, a shell snapshot) were left alone. Nothing under `~/.claude` was edited; `claude plugin validate` ran read-only on the repo.
- **Codex.** Only the fake-model e2e, with temp `HOME` and `CODEX_HOME` for every call including `codex --version`; `~/.codex` and its `config.toml` kept their modification times.
- **No `~/.notwice`**, no global git config (`git config --global --get-regexp '^hook\.'` is empty), no pushes, no GitHub calls (fake `gh`), nothing published. The monorepo was only cloned with `--shared`. `notwice memory` read `~/.claude` with a temp `NOTWICE_HOME` and wrote nothing.
