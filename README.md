# TAPP
TA application, assignment, and matching.

## Getting Started
These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes. The entire application is
Dockerized, using Ruby 2.5.1 and a Postgres database.

### Prerequisties

1. [Docker](https://docs.docker.com/install/#supported-platforms)
2. For Linux users only, [Docker Compose](https://docs.docker.com/compose/install/)
3. [Ruby](https://www.ruby-lang.org/en/documentation/installation/)

### Clone repo and run init script 
We have an init script that installs a linter (rubocop), as well as sets up a 
precommit hook to have the linter automatically run whenever you make a commit.
Clone this repo, navigate into the cloned directory, and run 
```
./script/init-setup.sh
```

### Running in a Docker Container
To launch the app, simply navigate into the cloned directory and run
```
docker-compose up
```

This will launch two containers: a rails app, and a postgres database. Access
the rails app by navigating to `http://localhost:3000`

If you have an existing image on your machine that needs to be updated, run
```
docker-compose up --build
```

To view the STDOUT from a docker container of a running server, you can do
`docker-compose logs -tf <image>`, like: `docker-compose logs -tf tapp`.

To access the dockerized app, simply run
```
docker-compose exec tapp sh
```

### Initializing DB
To create and setup your local development database, simply navigate into the
rails container and run the following rake task. It will create your local database,
run all migrations, and populate the db with seed data. 

```
rake db:setup
```

Once your DB is setup, you can have SQL access to it through your docker container by running
```
$ psql tapp_development tapp
```

## Annotations
We use the annotate gem to automatically annotate our models whenever a migration
to run. If you need to annotate manually, run `bundle exec annotate -p bottom` inside
the docker container.

## Rubocop
We use rubocop for linting and code styling. We have a pre-commit hook ready
that everytime you commit something, rubocop will automatically run on your
staged file to check for styling issues. The configuration is in `.rubocop.yml`
and you can add more (or change) or current styling with configurations found
on the [rubocop](https://rubocop.readthedocs.io/en/latest/) documentation.  To
run it manually, just call `rubocop` or `bundle exec rubocop`.

## Unit tests
We use RSpec as our testing suite. Our tests for models are located under
`spec/models`. Factories are provided by `FactoryBot` and are located under
`spec/factories`.  To run them, go into your local tapp container, and run:
```
# Get your test database similar to your development database
rake db:test:prepare

# Run entire test suite
rake spec

# Run tests for one specific class do rspec {file_name}
# For example,
rspec spec/models/position_spec.rb

# To run specific test block for a class, do rspec {file_name}:{line_number}
# where line number is the first line the block starts on
# For example,
rspec spec/models/position_spec.rb:17
```
## Playbook
### Accessing Docker Images through a shell command
To get into an interactive shell of any docker image, do `docker exec -it
<image_name> /bin/sh` Example: `docker exec -it tapp_tapp /bin/sh` will allow
you to move into a bash shell of the `tapp` application.  From there you can
inspect the Gemfile, run `rake db:migrate` or open up a rails console.

### Gemfile.lock sycnrhonization
To keep the Gemfile.lock synced up with what we have on our host machine, run
`docker-compose run <image> bundle install` followed by `docker-compose up
--build`.  

Example: `docker-compose run tapp bundle install`.

### Migration modifications
If you need to modify a migration file, please do the following within the
docker container: 
```
# Undo a specific version number
rake db:down VERSION=####
```
where the #### is the version you want to down from `rake db:migrate:status`.
Modify your database migration file, then run `rake db:migrate`

### Database 'tapp user not created' error
It is sometimes possible that you get a `tapp user not created` issue when
creating the db. To resolve this, remove the `db` folder from the `tmp`
directory, and then re-create everything with `rake db:setup`

If `rake db:setup` fails, do `rake db:create` to create a new database from
scratch and `rake db:migrate`.
