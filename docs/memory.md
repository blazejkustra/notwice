# Memory inventory (Claude Code)

`notwice memory` lists everything Claude Code agents on this machine are told to remember or obey: global rules and `CLAUDE.md`, the auto memory of every project (`MEMORY.md` and topic files), and each project's `CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md` and `.claude/rules`. It only reads: it prints a table sorted by importance, then one line per suggested action for you to apply by hand. `--json` prints the same data. Example with made-up data:

```
10 files that Claude Code agents load or can read, in ~/.claude. Nothing was changed.
"?" marks a proposed rule; "~" marks a recurrence counted from the file's own dates and PR numbers.

score  id                                   scope         loads      ~tok  age  backed      fires  recur  why                        flags
11.2   rules/writing.md                     global        always     20    30d  no-em-dash  2      3      recur+6 fires+3.2 scope+2
9.0    rules/delegation.md                  global        always     28    30d  prose       0      ~4     recur+7 scope+2
2.0    rules/apple.md                       global        always     23    25d  prose       0      ~0     scope+2                    dup:shop/apple-account

2.0    shop/apple-account                   project:shop  on-demand  23    3d   prose       0      ~0     scope+1 recency+1          dup:rules/apple.md
2.0    shop/CLAUDE.md                       project:shop  always     10    0d   prose       0      ~0     scope+1 recency+1
2.0    shop/MEMORY                          project:shop  always     20    3d   prose       0      ~0     scope+1 recency+1
2.0    shop/release-checklist               project:shop  on-demand  15    3d   prose       0      ~0     scope+1 recency+1          stale:~/old/release.sh global-fact

1.0    2026-11-20-disk-report/disk-cleanup  thread        on-demand  19    3d   prose       0      ~0     recency+1
1.0    2026-11-20-disk-report/MEMORY        thread        always     9     3d   prose       0      ~0     recency+1

0.0    2026-11-01-gone/lost-idea            orphan        never      13    3d   prose       0      ~0     scope-1 recency+1

Always-on tokens in a new session: 71 anywhere, 101 in project:shop, 80 in thread:2026-11-20-disk-report.

Suggestions:
- Enforce ~/.claude/rules/delegation.md: it cites 4 incidents; ask the learn skill to draft a rule from it, then run notwice propose.
- Delete ~/.claude/projects/-Users-me-code-shop/memory/apple-account.md: it repeats ~/.claude/rules/apple.md.
- Promote ~/.claude/projects/-Users-me-code-shop/memory/release-checklist.md into ~/.claude/rules if it applies to every project.
- Fix ~/.claude/projects/-Users-me-code-shop/memory/release-checklist.md: ~/old/release.sh no longer exists.
- Move ~/.claude/projects/-Users-me--t3-scratch-2026-11-20-disk-report/memory/disk-cleanup.md into ~/.claude/rules or a project memory if other sessions need it: only one scratch thread loads it.
- Rescue or delete ~/.claude/projects/-Users-me--t3-scratch-2026-11-01-gone/memory/lost-idea.md: no session loads it.
```

- **Scope.** `global` loads in every session. `project:<name>` loads in that repo and all its worktrees, which share the repo's memory folder. `thread` is a folder outside git under `~/.t3/scratch` (set `NOTWICE_SCRATCH_DIR` to change it), so only that one thread loads its memory. `orphan` loads nowhere: the folder is gone, it has no transcripts, or it is a worktree. A project folder's real path comes from the first `cwd` in the first 128 KB of its newest transcript, since the folder name cannot be decoded reliably.
- **Loads.** `always`: `MEMORY.md` (its first 200 lines or 25 KB), root instruction files, and rules without `paths:` frontmatter. `on-demand`: topic files, rules with `paths:`, and an `AGENTS.md` that a `CLAUDE.md` exists beside without importing it. `never`: `CLAUDE.md.bak` and orphans.
- **Tokens** are bytes / 4. The footer adds up the always-on tokens of a new session in each place.
- **Backed** lists notwice rules, active or proposed (`?`), whose `from:` names the file: `writing.md`, or a kebab-case memory name such as `deploy-steps`. `fires` counts their blocks in the last 30 days. `recur` counts their failure records, or with `~`, the distinct dates and PR numbers the file cites.
- **Score** is 3·log2(1 + recur) + 2·log2(1 + fires) + scope (global 2, project 1, thread 0, orphan -1) + recency (+1 when changed in the last 14 days, -1 after 60 days with no fires). The `why` column shows the parts.
- **Flags.** `dup:<id>` when at least 30% of the smaller file's three-word phrases also appear in the other. `copies:<n>` when identical project files (clones of one repo) fold into one row. `stale:<path>` for a missing `~/` or absolute path, `ephemeral:<path>` when that path was under `/tmp` or a scratchpad. `dangling:[[name]]` for a link to no memory. `global-fact` for a memory outside the global scope that says "every agent", "every brief", "any session", "this Mac" or "always": a cheap hint that it may belong in the global rules.
- It follows `CLAUDE_CONFIG_DIR` like Claude Code does, and defaults to `~/.claude`.
- It reads at most 128 KB of each project folder's newest transcript, so it stays fast with hundreds of projects (about 0.2 s of CPU on one machine).
- It finds project instruction files only where a Claude Code session has run, and it leaves skills out. The `dup`, `global-fact` and `~` recurrence columns are text heuristics: contradictions and paraphrased duplicates still need a person to read the files.
