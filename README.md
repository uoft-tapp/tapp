# TAPP
TA application, assignment, and matching.

## Getting Started
These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes. The entire application is
Dockerized, using Ruby 2.5.1 and a Postgres database.

### Prerequisties

1. [Docker](https://docs.docker.com/install/#supported-platforms)
2. For Linux users only, [Docker Compose](https://docs.docker.com/compose/install/)

### Running in a Docker Container
Clone this repo, navigate into the cloned directory, and run 
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

### Initializing DB
To create and setup your local development database, simply navigate into the
rails container and run the rake task: 

```
docker-compose exec tapp sh
rake db:setup
```

This will create your local database, run all migrations, and populate the db with seed data.

To access the dockerized database, you can run:
```
docker exec -it tapp_db_1 sh

# Once inside the db shell, access the database
$ psql tapp_development tapp
```
From there you can make modifications and regular SQL operations as necessary.

## Annotations
To annotate, please run `bundle exec annotate -p bottom`. Make sure you're in
the docker container.

## Rubocop
We use rubocop for linting and code styling. We have a pre-commit hook ready
that everytime you commit something, rubocop will automatically run on your
staged file to check for styling issues. The configuration is in `.rubocop.yml`
and you can add more (or change) or current styling with configurations found
on the [rubocop](https://rubocop.readthedocs.io/en/latest/) documentation.  To
run it manually, just call `rubocop` or `bundle exec rubocop`.

There is a pre-commit script set up under `script/pre-commit`. This is to run
Rubocop on any staged files and report any issues. To install, copy this into
`.git/hooks/pre-commit` and then run `chmod +x .git/hooks/pre-commit`. Now, on
every commit you make, rubocop will lint your code.

If you encounter errors such as `Please Install Rubocop`, make sure that Ruby
and rubocop are installed locally, **not** just in a Docker container. Ensure
`bundle install` installs the rubocop gem. Script adapted from
[here](http://gmodarelli.com/2015/01/code_reviews_rubocop_pre_commit/).

## Playbook
To get into an interactive shell of any docker image, do `docker exec -it
<image_name> /bin/sh` Example: `docker exec -it tapp_tapp /bin/sh` will allow
you to move into a bash shell of the `tapp` application.  From there you can
inspect the Gemfile, run `rake db:migrate` or open up a rails console.

To keep the Gemfile.lock synced up with what we have on our host machine, run
`docker-compose run <image> bundle install` followed by `docker-compose up
--build`.  

Example: `docker-compose run tapp bundle install`.

If you need to modify a migration file, please do the following within the
docker image: `docker run -it <image_name> sh` `rake db:down VERSION=####`
where the #### is the version you want to down from `rake db:migrate:status`.
Modify your file `rake db:migrate`

It is sometimes possible that you get a `tapp user not created` issue when
creating the db. To resolve this, remove the `db` folder from the `tmp`
directory

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...
