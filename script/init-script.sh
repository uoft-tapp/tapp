gem install rubocop
# is this right? have to be in root of local clone, so path to script is just ./script/pre-commit
ln -s ../../script/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
