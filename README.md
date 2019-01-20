# TAPP
TA application, assignment, and matching.

## Getting Started
These instructions will get a copy of the project up and running on your
local machine for development and testing purposes. Currently, the backend 
(using Ruby 2.5.1 and a Postgres database) is dockerized and the frontend 
must be run manually.

### Prerequisties

1. [Docker](https://docs.docker.com/install/#supported-platforms)
2. [Docker Compose](https://docs.docker.com/compose/install/) (Must be installed seperately on Linux)*
3. [Ruby](https://www.ruby-lang.org/en/documentation/installation/)
4. [Yarn](https://yarnpkg.com/lang/en/docs/install/)

* If you are running OSx or Windows, your Docker installation will have 
come with docker-compose. 

### Clone the repo and run the init script 

We have an init script that installs a linter (rubocop) and sets up a 
precommit hook making the linter run automatically whenever you commit.
It is kept under our `script` directory.

After cloning the repo and navigating into the cloned directory, run the init script
in your shell. To do so in bash, for example, invoke:

```
bash script/init-script.sh
```

### Running the backend with Docker

To begin, make sure that Docker is running on your system. Once it is, invoke

```
docker-compose up
```

from the cloned directory.

This will launch two containers: a rails app, and a postgres database. You can 
access the rails app from your browser by navigating to `http://localhost:3000`. 
(Bare in mind that in tapp, rails is meant only to serve the API, not views.)

If you already have an existing image running on your machine that you would
like to rebuild, run

```
docker-compose up --build
```

To view the STDOUT from a docker container of a running server, you can invoke

```docker-compose logs -tf <image>```

### Navigating into the containers from the command line

Currently, we define two services under docker-compose: tapp and db. If you would
like to interact with either container from the command line, you can do so by 
invoking:

```
docker-compose exec [service] sh
```

To interact with the rails app, invoke `docker-compose exec tapp sh` and to
interact with the database, invoke `docker-compose exec [db] sh`.

### Initializing the Database

To both create and setup your local development database, navigate into the
rails container and run: 

```
rake db:setup
```

This will create your local database, run all migrations and populate the DB 
with seed data. 

Once your DB is setup, you can gain SQL access to it by first navigating into 
the DB container, then invoking:

```
$ psql tapp_development tapp
```

## Running the React frontend

To run the front end, open a new terminal instance and navigate into the `frontend` directory. Once there, invoke

```
yarn install
```

to update all packages. With that done, serve the frontend by invoking 

```
yarn start
```

You will be able to access it at `http://localhost:8000`. Note that, as mentioned earlier,
unlike most traditional rails app, under our project, rails does not serve views.
It only provides the API which the frontend, served seperately by yarn, pulls from.

## Annotations
We use the annotate gem to automatically annotate our models whenever a migration
to run. If you need to annotate manually, run `bundle exec annotate -p bottom` inside
the docker container.

## Rubocop
As mentioned, we use rubocop for linting and code styling. We have a pre-commit hook 
ready that everytime you commit something, rubocop will automatically run on your
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

### Gemfile.lock synchronization
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

If `rake db:setup` fails, invoke `rake db:create` to create a new database from
scratch and `rake db:migrate`.
