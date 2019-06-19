# TAPP
TA application, assignment, and matching.

## Contributing
<details>
<summary>If you would like to contribute to the project, we ask that you follow the following conventions.</summary>
<p>

### Issues

**Scope** 

- Everything you contribute, no matter how small, should always start with a new issue. The scope of these problems can be quite broad, if necessary, and can be decomposed into collection of smaller issues as the team sees fit. This allows us to be both in documented conversation about what work needs to be done, and to be aware of who has taken on different tasks.

**Structure** 

- The issue title and description should be as descriptive as possible. 
- If you want to take on an issue, assign yourself to it first so that we can track which ones need attending to. 
- We allow two special kinds of issues, proposal and question. Their issue titles should start with [proposal] or [question] respectively, and are meant for issues that require team input. 
- Please label issues as appropriate to the labels that already exist. If you would like to add a new one, open a proposal issue for it. 

### Branches

You should **never** push directly to master! Instead, please make a new branch who's name conforms to the following format:

TAPP-[issue number]

i.e. TAPP-1

### Commits

**Scope** 

- An individual commit should always track the smallest unit of work possible, within reason. We want to seperate concerns, as this helps for better debugging, revieweing and log readability. 

**Structure** 

The general structure should always be: 

[change type]([change region]): [short msg]  
[detailed msg]

Where
**[change type]** is one of:

- feat: A new feature
- fix: A bug fix
- ehancement: An improvement on a feature
- refactor: A code refactor
- style: A purely stylistic change to the code
- test: Any change to or addition of tests

**[change region]** is a name of a logical region of code in the project, i.e. 
- docker
- api
- db
- frontend
- documentation
- ... etc

**[short msg]** should not exceed 50 chars

**[detailed msg]** should provide a more detailed message on the next lines.

Example, of two commits:

```
enhancement(frontend): add new view for adding positions

This patch introduces a new front end view for adding positions to the system.
```

```
fix(api): Fix api endpoint for adding positions

This patch fixes a bug in the API whereby attempts to hit the endpoint meant for
adding a new position would always fail.
```

### Pull Requests

**Scope**

- The title of PR should either be exactly the issue title, or a rewording
- The PR description should mention the associated issue with a hashtag, so that it can be linked 
- All commits meant to resolve an issue must be reviewed by at least one member of the team
- The reviewer will not merge commits until their changes are addressed, if requests for change apply
- The reviewee should either rebase their changes onto their commits and push, or push follow up commits addressing reviewer changes
- The reviewer must be the one to merge the PR after they approve their changes
- If the PR commits must be rebased, the reviewee is responsible for doing this and should do so in a seperate commit
- Github's automatic merge commits are acceptable
- The reviewer must delete the associated branch once the PR is merged (GH provides an option for this)
</p>
</details>

## Getting Started
These instructions will get a copy of the project up and running on your
local machine for development and testing purposes. Currently, the entire app 
(using React/Redux, Ruby 2.5.1 and a Postgres database) is dockerized.

### Prerequisties

1. [Docker](https://docs.docker.com/install/#supported-platforms)
2. [Docker Compose](https://docs.docker.com/compose/install/) (Must be installed seperately on Linux)
3. Ruby, only if you would like to use the precommit hook

*If you are running OSx or Windows, your Docker installation will have come with docker-compose.*

### Rubocop and eslint precommit hook


If you want to work on the Rails API, we maintain a script that installs a linter (rubocop) and sets up a 
precommit hook making the linter run automatically whenever you commit.

If you would like to install it, invoke:

```
bash ./init.sh
```

### Project Structure

The app is organized into three entities:

- A rails app, which serves the API
- A postgress database that the API interacts with directly
- A React app, which serves as the frontend for the app

### Running the app with Docker

#### Overview
We have four docker compose files that are important to know:
1. `docker-compose.yml` is our base docker-compose file. This by itself will
   build the db and the API
2. `docker-compose.dev.yml` is our development docker-compose file (`docker-compose.override.yml` is
    a symbolic link to this file). This will
   dynamically serve the frontend via a local webpack dev server.
3. `docker-compose.prod.yml` is our production docker-compose file. This will
   also build the db and API, but not the front end
3. `docker-compose.frontend.yml` This will use webpack to build
   the frontend for serving as a static asset.

#### Development Environment First Install

The first time you run docker, you must build the docker images. First, ensure no
docker images are running with

```
docker-compose down
```

Set up the local environment with

```
cp dev.env .env
```

In development mode, the frontend is served via nodejs on port `8000` while the backend/api
is served on a different port. To prevent confusion if you try to access TAPP through the wrong
port, set up a static asset to be served by rails.

```
mkdir api/public && echo "Please go to localhost:8000 for frontend" > api/public/index.html
```

Finally, we can build the docker images and migrate the database

```
docker-compose build
docker-compose run api rake db:setup
docker-compose run api rake db:migrate
```

Now you can run the project with

```
docker-compose up
```

Access the frontend by navigating to [http://localhost:8000](http://localhost:8000)

#### Development Environment

The development environment can be started with

```
docker-compose up
```

This is equivalent to the command `docker-compose -f docker-compose.yml -f docker-compose.override.yml up`
or `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`
since `docker-compose.override.yml` is a symbolic link to `docker-compose.dev.yml`.


#### Debugging

To view the STDOUT from a docker container of a running server, you can invoke

```docker-compose logs -tf <image>```

To stop everything, use `docker-compose down`.

### Navigating into the containers from the command line

Currently, we define three services under docker-compose: frontend, api, and
db. If you would like to interact with any of the containers from the command
line, you can do so by invoking:

```
docker-compose exec [service] sh
```

For instance, to interact with the rails app, invoke `docker-compose exec api sh`.

### Initializing the Database

To both create and setup your local development database, navigate into the
rails container and run:

```
rake db:setup
```

or from the host environment run

```
docker-compose run api rake db:setup
```

This will create your local database, run all migrations and populate the DB 
with seed data. Note that seed data is loaded from `api/db/seed/` folder where
each json file represents a table.

Once your DB is setup, you can gain SQL access to it by first navigating into 
the DB container, then invoking:

```
$ psql tapp_development tapp
```

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

## Common Issues

1. Docker believes that a server is already running, and fails to run the api container. 

After `running docker-compose up`, you may see a message that reads `A server is already running. Check /app/tmp/pids/server.pid.`. The api container will fail. 

To resolve this issue, halt the docker-compose command (killing the other containers) with cmd-c/ctrl-c, and delete the file located under the project route at `api/tmp/pids/server.pid`. You will be able to relaunch the server without issues. This issue normally arises when you kill the running instance of the project without alloting time for a proper teardown.

2. Docker cannot start up a front-end service, complaining that it can't find an image.

You can resolve this by using `docker containers ls -a`, finding all
deactivated containers, and then removing them with `docker container rm
[container ID]`. Then, you should be able to run `./start_local.sh`
