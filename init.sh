TOP_LEVEL="$(git rev-parse --show-toplevel)"
HOOKS="$TOP_LEVEL/.git/hooks"

cp $TOP_LEVEL/resources/pre-commit $HOOKS

chmod +x $HOOKS/pre-commit