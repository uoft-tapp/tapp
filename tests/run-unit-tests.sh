#!/bin/bash

cd $(git rev-parse --show-toplevel)

# we want to run all formatting tests and
# return a non-zero exit code only if one of them fails
EXIT_CODE=0

ErrorHandler () {
	EXIT_CODE=$(($EXIT_CODE+$?))
}

trap ErrorHandler ERR

echo 'This script assumes that all docker images are up and running.'
echo 'If they are not, please run `docker-compose up` and rerun this script.'

# Run all tapp unit tests
echo "Running Unit Tests..."
# set the CI variable to true so that `npm test` doesn't run in --watch mode.
docker-compose run -e CI=true frontend npm test
docker-compose run api rspec --pattern ./spec/controllers/api/v1/*_spec.rb

exit $EXIT_CODE
