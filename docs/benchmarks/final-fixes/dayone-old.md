| repo with no manifest: Stop after a code edit | block: {"decision":"block","reason":"notwice: this session still breaks these rules. Fix them before you finish:\n- verify [tests-after-code] After code changes, run t |
| repo with package.json and pnpm-lock.yaml: Stop hint | for example: npm test.; ends with escape: no |
| moved binary: git commit | exit 1: "/private/tmp/nfinal.LvnfJC/d-old/bin/notwice" git-hook pre-commit: /private/tmp/nfinal.LvnfJC/d-old/bin/notwice: No such file or directory |
| notwice install-git-hooks --global --help | exit 0, Installed notwice pre-commit, commit-msg and pre-push hooks  |
| notwice init --help | exit 0, Rules home: /private/tmp/nfinal.LvnfJC/d-old/home |
| notwice approve --help | exit 1, notwice: no proposed rule "--help" |
| notwice --help | exit 1, notwice turns corrections into rules that hooks and CI enfor |
| global git config after the --help calls | 6 notwice lines |
