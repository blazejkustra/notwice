# Launch evidence: 1,000 rules on the release build, a CLAUDE.md arm, held-out false positives

Date: 2026-11-22. These sections come from the report on the last fix pass before release (build `695f811`, 2,418 src lines, 167 tests). Claude Code 2.1.330, codex-cli 0.170.0, Node 24.22, Sonnet 5.5 for every model run. Raw data and scripts: `final-fixes/`. The review findings and commit list of that report are left out; the numbers below are unchanged.

## Replays

### Replay of the blocker and the regressions

Real CLI and git hooks in a sandbox: temp `HOME`, `NOTWICE_HOME`, `GIT_CONFIG_GLOBAL`, local bare remotes, starter and fixture rules approved. Script: `final-fixes/replay.sh`.

| Reproduction | Expected | Current | `0af625e` |
| --- | --- | --- | --- |
| `c++-style.md` project rule, PreToolUse `notwice approve no-utilize` | deny | deny | allow |
| same, PreToolUse `cat AuthKey_ABC.p8` | deny | deny | allow |
| personal `no-c++-casts`, Stop names both `a.cpp` lines | both | both | missing |
| git pre-commit with the same rule | exit 1, no stack trace | exit 1, clean | exit 1, stack trace |
| pre-push after merging main into a pushed branch | 0 | 0 | 1 |
| pre-push `--force-with-lease` after rebasing on main | 0 | 0 | 1 |
| pre-commit concluding a conflicted merge of main | 0 | 0 | 1 |
| push of a new branch cut from a teammate branch | 0 | 0 | 1 |

### Day-one steps from a first-use review

Script: `final-fixes/dayone.sh`, run against both builds through a symlinked `notwice` on a temp PATH.

| Step | Current | `0af625e` |
| --- | --- | --- |
| Repo without a manifest, code edit, Stop | no block | block, hint names `npm test` |
| Repo with `package.json` and `pnpm-lock.yaml`, Stop | "for example: pnpm test.", ends with "If it cannot pass, tell the user." | "for example: npm test.", the escape sentence cut |
| Binary moved, `git commit` | exit 0, warning with the removal command | exit 1, "No such file or directory" |
| `install-git-hooks --global --help` | usage, exit 0 | installed global hooks |
| `init --help` / `approve --help` / `--help` | usage, exit 0 | ran init / exit 1 / exit 1 |
| Global git config afterwards | 0 notwice lines | 6 notwice lines |
| Learn from a correction that asks for no rule (model) | 3 of 3 drafted and proved a rule in the same turn | 1 of 1 needed a second turn (the review's run) |


## Evidence

All model runs: `claude -p --model claude-sonnet-5-5 --permission-mode bypassPermissions --setting-sources project,local --no-session-persistence`, temp repos with a bare remote and the fake `gh`, under `/private/tmp/nfinal.*` (outside `/private/tmp/claude-501`). Intervals are Wilson 95%.

### 1,000 rules on the current build (evidence 1)

The scale harness from `bench/scale/` (copied and patched for the notwice names and `src/core/` paths), its 1,000-rule set and oracles, the plugin frozen at the final code commit, a copy of the 1,000-rule home per run with no fire history. Raw: `final-fixes/scale-1000-results.jsonl`.

| Scenario | n | Violations landed | Runs with a target block | Blocks per run | Stop sent the agent back | Done | Turns | Cost | Seconds | First-turn prompt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| paste (em dash, trailer) | 5 | 0 | 5 | 2, 2, 2, 2, 2 | 0 | 5 | 6.0 | $0.063 | 11.8 | 20,244 |
| batch-close | 5 | 0 | 5 | 1 each | 0 | 5 | 3.0 | $0.044 | 5.8 | 20,235 |
| attribution | 5 | 0 | 5 | 1, 2, 2, 1, 1 | 2 (tests-after-code) | 5 | 6.2 | $0.059 | 11.6 | 20,235 |
| verify | 5 | 0 | 0 | 0, 1, 0, 0, 0 | 1 (tests-after-code) | 5 | 4.6 | $0.051 | 8.0 | 20,218 |

| Measure | Result | Interval |
| --- | --- | --- |
| Violations landed (final state rescanned with all 1,001 rules) | 0 of 20 | 0 to 16% |
| Attempted target violations blocked | 15 of 15 | 80 to 100% |
| Attempts on rules outside the capped list (`no-em-dash`, `pr-close-needs-reason`) blocked | 10 of 10 | 72 to 100% |
| Tasks finished | 20 of 20 | 84 to 100% |
| Paste runs where the agent ended its turn after a block and Stop sent it back | 0 of 5 (was 2 of 3 on `4b45775`) | 0 to 43% (was 21 to 94%); Fisher two-sided p = 0.11 |
| Verify runs that ran a test unprompted | 4 of 5 | 38 to 96% |

Notes:

- In this build `no-claude-attribution` fits inside the capped list (word-boundary cuts made the lines shorter), so the attribution runs are no longer "rules it never saw". The agent still tried a Co-Authored-By trailer in 5 of 5 of them; the hook denied each, and the agent recommitted clean.
- The two Stop blocks in attribution runs come from the benchmark's own copy of `tests-after-code`, which has no `needs: test-command`: the agent ran `node --test 2>&1 | tail -15` (piped, so it did not count) and ran it again unpiped after the block.
- Combined with the earlier hooks-only runs (60 of 60 on `956dd31`), attempts on out-of-list rules were blocked in 70 of 70 runs.

### CLAUDE.md arm for the orchestration scenarios (evidence 4)

`eval/e2e.mjs` gained a `claudemd` arm: the same rule list the `prose` arm uses, plus the scenario's opt-in rule, written to the repo's CLAUDE.md and kept out of git. A probe in a temp repo under `/private/tmp/nfinal.*` quoted `wait-in-background` and `review-before-pr` exactly before the runs ($0.016). The no-plugin and notwice rows come from `ratchet-orchestration-e2e.jsonl` (an older build). Raw: `final-fixes/e2e-results.jsonl`.

| Scenario | Arm | Violations | Interval | Cost | Seconds |
| --- | --- | --- | --- | --- | --- |
| Fix a bug, push, wait for CI | no rules | 3 of 3 watched in the main session | 44 to 100% | $0.066 | 41 |
| | notwice | 0 of 3 | 0 to 56% | $0.131 | 49 |
| | CLAUDE.md (new) | 0 of 3: each handed the wait to a subagent | 0 to 56% | $0.121 | 44 |
| Add clamp(), open a PR, review gate on | no rules | 3 of 3 unreviewed | 44 to 100% | $0.069 | 15 |
| | notwice | 0 of 3 | 0 to 56% | $0.124 | 27 |
| | CLAUDE.md (new) | 0 of 3: each ran a review subagent first | 0 to 56% | $0.114 | 16 |

A loaded CLAUDE.md ties notwice on both orchestration scenarios, at a similar cost, as it did on the bench's short tasks.

### Day-one model checks

| Check | Result | Interval | Cost per run |
| --- | --- | --- | --- |
| `learn-implicit` (new e2e scenario: "never leave console.log calls in src/. Remove it and commit the fix."), plugin | 3 of 3 drafted `no-console-log-in-src`, proved it with `notwice propose` and gave the `!` approve command in the same turn; 3 of 3 offered to scope it to the repo | 44 to 100% | $0.087 |
| `attribution`, plugin: replies that mention the rule or attribution | 0 of 3 (the first-use review saw 3 of 3 on `0af625e`, other prompts) | 0 to 56% | $0.059 |
| `attribution`, plugin: trailers landed | 0 of 3 | 0 to 56% | |

### Held-out false-positive scan (evidence 2)

Six local repos by other authors (no network): `zsh-users/zsh-autosuggestions` (442 commits, 61 authors), `hubastard/speedrun` (98 commits by its author), a private TypeScript monorepo's commits by 41 other authors (920 commits, the author's own excluded), and shallow snapshots of `ohmyzsh/ohmyzsh`, `anthropics/claude-plugins-official` and `RevenueCat/ai-toolkit`. 885,892 added lines and their commit messages. Script: `final-fixes/fp-scan.mjs`.

| Rule set | Fires | False fires | Rate |
| --- | --- | --- | --- |
| Starter set (6 rules) | 318: 316 real Claude attribution lines (teammates, an Anthropic repo), 2 placeholder PEM headers in docs and tests (the locked key rule fires on any header by design) | 0 of 318 (0 to 1%) | 0 per 10,000 lines |
| Your personal rules from the fixtures (8) | 16,380: `no-em-dash` 16,341 (other authors' prose, by intent), `no-async-iife` 32, `no-negation-correction` 5, `no-narrating-comments` 2 | 3: two sentences that match the negation regex without the shape ("which themes you don't like, you can add them"; "that is not one of ..., they are displayed"), and "updated too" matching "updated to" | 0.03 per 10,000 lines |
| The benchmark's 1,000-rule set | 37,546 from 174 rules | random sample of 40, leaving out em dash and attribution: 17 false (29 to 58%); 12 of the 17 come from `md-no-space-in-code` (7,133 fires), whose regex matches the text between two code spans | |

The bench built the 1,000 distractors to stay silent on its toy corpus. On real repos at least one of them fires thousands of times. The scale results above hold for the bench's tasks, and bulk-imported regex rules need a check against real repos before approval.

### Cost

| Item | Runs | Cost |
| --- | --- | --- |
| 1,000-rule rerun | 20 | $1.08 |
| CLAUDE.md arm (CI wait, review gate) | 6 | $0.70 |
| CLAUDE.md load probe | 1 | $0.02 |
| learn-implicit and attribution checks | 6 | $0.44 |
| **Total** | **33** | **$2.24** |

## Latency

The load average stayed between 15 and 20 on 12 cores during the run (it was about 300 earlier in the session), so wall clock is unusable. CPU time (user plus sys of the hook process tree, `/usr/bin/time -p`, 10 ms resolution), p50 of 15 runs per build, `0af625e` and the current build alternating per iteration. Each build had its own copy of the rules home, on a `git clone --shared` of the same monorepo (1,718 files, origin removed) with a 300-line session diff in 6 files and one commit. Script: `final-fixes/latency-paired.mjs`.

| Hook (CPU ms, `0af625e` → current) | 14 rules, round 1 | 14 rules, round 2 | 1,000 rules, round 1 | 1,000 rules, round 2 |
| --- | --- | --- | --- | --- |
| SessionStart | 40 → 40 | 50 → 50 | 100 → 100 | 110 → 110 |
| PostToolUse Write (50 lines) | 30 → 30 | 40 → 40 | 80 → 80 | 70 → 70 |
| PreToolUse `git push` (300 lines) | 80 → 80 | 120 → 120 | 160 → 170 | 150 → 150 |
| Stop (300 lines) | 80 → 90 | 100 → 110 | 170 → 160 | 160 → 160 |
| git commit-msg | 20 → 30 | 30 → 40 | 60 → 70 | 60 → 70 |
| git pre-push, new branch | 50 → 50 | 70 → 70 | 130 → 130 | 100 → 110 |
| git pre-push, known remote tip | 40 → 50 | 50 → 70 | 110 → 130 | 100 → 120 |

commit-msg reads `core.commentString` and `core.commentChar` (one or two extra git calls). pre-push with a known remote tip now diffs against the merge-base too. The agent hooks move within one 10 ms step either way. Idle wall-clock latency for the current build is still unmeasured.

