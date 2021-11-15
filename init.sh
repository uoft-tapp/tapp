TOP_LEVEL="$(git rev-parse --show-toplevel)"
HOOKS="$TOP_LEVEL/.git/hooks"

cp $TOP_LEVEL/resources/pre-commit $HOOKS

chmod +x $HOOKS/pre-commit
# List all formatting changes (e.g. Prettier upgrades) in .git-blame-ignore-revs
# They will be ignored by gitblame if the commit ids are listed in that file
git config blame.ignoreRevsFile .git-blame-ignore-revs
