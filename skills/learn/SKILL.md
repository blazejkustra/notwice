---
name: learn
description: Turn a user's correction into a proposed notwice rule with a machine check. Use right away, in the same turn, when the user corrects you or repeats a complaint ("don't do X", "never", "always", "I told you", "stop doing that"), or asks you to remember a rule.
---

# Learn from a correction

A correction becomes a rule that hooks enforce in every repo. You propose; only the user approves.

Draft the rule in the same turn as the fix, without asking whether to. A proposal changes nothing until the user approves it, and they can retire it with one command.

1. Find the part a machine can check: a regex that must not match (`forbid`) added lines, commit messages, PR text, comments and chat replies, or Bash commands (`targets: [commands]`, with an optional `unless` regex); PR sections that must appear in order (`require`); or a check that must pass after certain files change (`verify`), when you skipped testing or claimed it works without running it ("you didn't test on Android"). If nothing is checkable, tell the user and stop. Never write a prose-only rule.
2. Run `notwice list`. If an existing rule covers it, say so and stop.
3. Write `<rules home>/proposed/<id>.md`, where `<id>` is a short kebab-case name (the rules home is in your session context). Use `<repo>/.notwice/proposed/` instead only when the user wants the rule for the whole team.

   ````
   ---
   kind: forbid
   pattern: '<JS regex in single quotes>'
   targets: [files, commits, pr, comments]
   severity: block
   from: <repo> <YYYY-MM-DD>
   ---
   <One line the agent will see: the rule and how to fix a violation.>

   ## Bad
   ```
   <the real line, message or command from this incident, copied exactly>
   ```

   ## Good
   ```
   <the corrected version>
   ```
   ````

   Keep patterns narrow. Use `severity: warn` when false positives are likely, and `paths: ['*.md']` to limit file checks. Add `in: main` to a forbid rule on commands or files that only the main session must follow ("wait for CI in a background agent").

   A `verify` rule uses `when` (globs of changed files that need the check), `run` (a regex for the Bash commands or MCP tool names, such as `mcp__emulator__screenshot`, that count; only passing runs count) and an optional `claims` regex for phrases in your final reply. Its examples are sessions, one step per line:

   ````
   ## Bad
   ```
   edit src/screens/Home.tsx
   run npm test
   say Works on Android.
   ```

   ## Good
   ```
   edit src/screens/Home.tsx
   run mcp__emulator__screenshot
   say Works on Android.
   ```
   ````

   Add `at: pr` when the check belongs before `gh pr create` ("review in a fresh agent before the PR"); Stop then skips it. A finished subagent counts as `run Agent(<subagent_type>): <description>`.
4. Run `notwice propose <id> "<what happened, one sentence>"`. It proves the Bad example triggers the rule and the Good one passes, then records the failure. Fix the rule and rerun until it passes.
5. Show the user the rule and tell them how to approve it: `! notwice approve <id>` in Claude Code, or `notwice approve <id>` in a terminal. Never run `notwice approve` yourself. When the rule fits only this repo (its `paths` name this repo's folders, or the correction was about this codebase), say so and offer to move it to `<repo>/.notwice/proposed/`, since a personal rule applies in every repo.
