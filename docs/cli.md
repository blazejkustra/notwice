# CLI

```
notwice init                         add the starter rules to proposed/
notwice list                         show active, proposed and retired rules
notwice test [id...]                 prove rules: Bad must trigger, Good must pass
notwice propose <id> "<incident>"    prove a drafted proposal and record the failure
notwice approve <id...>              activate proposals (only the user runs this)
notwice retire <id...>               retire active rules or proposals (only the user runs this)
notwice check [--base <ref>]         check the branch diff and commits
notwice check --ci [--base <ref>] [--pr-title <t>] [--pr-body-file <f>] [--format text|github|json]
                                     check a PR in any CI (GitHub and GitLab are read automatically)
notwice install-git-hooks [--global] add pre-commit, commit-msg and pre-push hooks through git config
notwice uninstall-git-hooks [--global]
notwice stats                        fires per rule and prune candidates (60 days unused)
notwice memory [--json]              list what agents are told to remember or obey, read-only
notwice agents [--days N] [--all]    sessions and their subagents, last 24 h by default
notwice hook [--agent claude|codex]  run an agent hook (JSON on stdin)
```

The Claude Code plugin puts `notwice` on the PATH of the agent's Bash tool and of `!` commands. For your own terminal, git hooks and Codex, link `bin/notwice` from a clone into a folder on your PATH (see the [README](../README.md#install)). `--help` or `-h` on any subcommand prints this usage and changes nothing.
