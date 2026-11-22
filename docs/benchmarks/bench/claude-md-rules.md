Follow these rules:
- no-claude-attribution: No Claude or Anthropic attribution in commits, PRs or comments: no Co-Authored-By Claude, no "Generated with Claude Code", no Claude-Session or claude.ai session links.
- no-em-dash: Never use em dashes. Use a comma, colon, parentheses or a full stop. In code that must match existing text, write \u2014.
- pr-close-needs-reason: Close a PR only with a reason: gh pr close <n> --comment "<why, and what replaces it>".
- pr-no-extra-sections: PR bodies have no sections beyond Problem, Approach, Scope, Tests and Screenshots. Put decisions for the user in chat.
- pr-sections: PR bodies use exactly these sections in order: ## Problem, ## Approach, ## Scope, ## Tests, ## Screenshots.
- tests-after-code: After code changes, run tests, typecheck or lint on their own (no pipe) before you finish. Never claim tests pass without a passing run.
