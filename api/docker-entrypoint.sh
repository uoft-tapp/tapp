#! /bin/bash
bundle exec rails db:migrate

if [[ $? != 0 ]]; then
  echo
  echo "== Failed to migrate. Running setup first."
  echo
  bundle exec rails db:setup
fi

# Execute the given or default command:
exec "$@"