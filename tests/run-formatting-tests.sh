#!/bin/bash

cd $(git rev-parse --show-toplevel)

# we want to run all formatting tests and
# return a non-zero exit code only if one of them fails
EXIT_CODE=0

ErrorHandler () {
	EXIT_CODE=$(($EXIT_CODE+$?))
}

trap ErrorHandler ERR

# Run all code formatting tests
echo "Running Code Formatting Tests..."
yarn run prettier-check "frontend/src/**/*.js"
yarn run prettier-check "frontend/src/**/*.ts"
yarn run prettier-check "frontend/src/**/*.jsx"
yarn run eslint "frontend/src/**/*.js"
yarn run eslint "frontend/src/**/*.jsx"

exit $EXIT_CODE
