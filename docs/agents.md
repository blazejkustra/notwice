# Agents tracker

`notwice agents` prints the sessions active in the last 24 hours (`--days N`, `--all`), grouped by folder and branch, with their subagents, the sessions started from their Bash, and what notwice saw. Example with made-up data:

```
shop  feat/cart-totals  ~/code/shop
├ 3ac7069d  working 12s  "add throttling docs"  verify: tests-after-code unmet
│ └ 40753972  session  ended 2m     "Reply ok"  verify ok
└ 2e5e1545  waiting 2m   "fix the review comments on #212"  PR #212  verify ok  1 block
  ├ a8a37f80  general-purpose  done 6m      Review #212 diff
  └ a0e19b71  general-purpose  running 3m   bg  Wait for CI on #212
blog  main  ~/code/blog
└ 9f0011aa  stale 41m    "draft the launch post"
```

- **Rows.** A session shows its first prompt, state and time since its last activity, the PRs it opened, the verify rules left unmet at the end of its last turn, and its blocks (its subagents' included). A subagent shows its type, `running` or `done`, `bg` when it runs in the background, its description and its own blocks. Nested subagents sit under the subagent that started them.
- **States.** `working`: active since its last turn. `idle`: the turn ended and nothing runs, so it is your move. `waiting`: the turn ended with background work still running. `stale`: working, but quiet for 30 minutes (a hung wait or a crash). `ended`: the session closed.
- **Storage.** Hooks append one short line per lifecycle event (session start and end, first prompt, subagent spawn, start and finish, PR opened, end of turn) to `$NOTWICE_HOME/agents/<YYYY-MM>.jsonl`, and touch a per-session file on every hook call for the last activity. Each line is one append well under 1 KB, so concurrent hooks never interleave; a reader skips a torn line. Session start deletes monthly files after 60 days.
- **Scope.** It shows what notwice records, on this machine. For live PR review and check state use `gh pr status` or T3's Pull requests page. First prompts (120 characters), subagent descriptions, folders and branches stay in `$NOTWICE_HOME`.

