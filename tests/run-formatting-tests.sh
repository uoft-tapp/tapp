#!/bin/bash

# Run all code formatting tests
echo "Running Code Formatting Tests..."
yarn run prettier-check "frontend/src/**/*.js"
yarn run prettier-check "frontend/src/**/*.jsx"
yarn run eslint "frontend/src/**/*.js"
yarn run eslint "frontend/src/**/*.jsx"
